"use strict";

const fs = require("fs");
const moment = require("moment");
const flatten = require("lodash.flatten");
const sample = require("lodash.sample");
const dataFilePath = process.env.HUBOT_CHISHA_JSON_FILE;

const createSessions = {};

function getQuestionBySession(session) {
  return {
    1:  `去这家 ${session.name} 有多远？(单位：米)`,
    2:  `这家 ${session.name} 人均价格是多少？(单位：元)`
  }[session.step];
}

function getDeletors(restaurant) {
 return Array.from(new Set(restaurant.deletors));
}


function renderRestaurant(restaurant) {
  const average = getAverage(restaurant).toString().slice(0, 3);
  return `**${restaurant.name}** ${restaurant.halal ? '[清真]' : ''} 平均分：${average}, 距离：${restaurant.far} 米，人均：${restaurant.price} 元`
};

function getAverage(restaurant) {
  const ranks = Object.values(restaurant.ranks);
  if (ranks.length) {
    return (ranks.reduce((a, b) => a + b) / ranks.length).toString().slice(0, 3);
  } else {
    return 5;
  }
}

function getWeight(restaurant) {
  const farPoint = restaurant.far > 1000 ? 0 : 1000 - restaurant.far;
  const pricePoint = restaurant.price > 100 ? 0 : (100 - restaurant.price) * 10;
  const rankPoint = getAverage(restaurant) * 100;
  return farPoint + pricePoint + rankPoint;
}

function renderMembers(members) {
  return members.map((id) => `@<=${id}=>`).join(' ');
}

module.exports = (robot) => {
  function loadData () {
    if (dataFilePath) {
      return JSON.parse(fs.readFileSync(dataFilePath)) || {};
    } else {
      return JSON.parse(robot.brain.get("hubot-chisha")) || {};
    }
  }

  function saveData (data) {
    if (dataFilePath) {
      fs.writeFileSync(dataFilePath, JSON.stringify(data));
    } else {
      robot.brain.set("hubot-chisha", JSON.stringify(data));
    }
  }

  (function ensureJsonFile() {
    try {
      loadData();
    } catch (err) {
      saveData({});
    }
  })();



  robot.respond(/吃啥(帮助| help)/i, (res) => {
    res.send(`吃啥相关暗语说明：
1. 吃啥 roll [近/便宜/老板请客/清真/好吃] => 获得专业美食推荐
2. 吃啥 list => 获得当前美食列表
3. 吃啥 add [name] => 添加新餐厅
4. 吃啥 rank [name] [n] => 给某餐厅打分(0 - 10)
5. 吃啥 del [name]  => 删除餐厅(需要两个人同意)
6. 吃啥 halal [name]  => 标记餐厅为清真餐厅
    `);
  });

  robot.respond(/吃啥 roll([\s\S]*)/i, (res) => {
    const data = loadData();
    let restaurants = Object.values(data);

    if (res.match[1].indexOf('近') !== -1) {
      restaurants = restaurants.filter((restaurant) => restaurant.far < 300)
    }

    if (res.match[1].indexOf('便宜') !== -1) {
      restaurants = restaurants.filter((restaurant) => restaurant.price <= 30)
    }

    if (res.match[1].indexOf('老板请客') !== -1) {
      restaurants = restaurants.filter((restaurant) => restaurant.price >= 30)
    }

    if (res.match[1].indexOf('清真') !== -1) {
      restaurants = restaurants.filter((restaurant) => restaurant.halal)
    }

    if (res.match[1].indexOf('好吃') !== -1) {
      restaurants = restaurants.filter((restaurant) => getAverage(restaurant) > 6)
    }

    if (restaurants.length) {
      const list = flatten(restaurants.map((restaurant) => new Array(getWeight(restaurant)).fill(restaurant.name)));
      const restaurant = data[sample(list)];
      res.send("我给出的选择是：\n" + renderRestaurant(restaurant));
    } else {
      res.send("还没有符合的餐厅数据，跟我说： 吃啥 add `餐厅名称` 来添加餐厅");
    }
  });

  robot.hear(/([\s\S]*)/i, (res) => {
    const session = createSessions[res.message.user.id];
    const anwser = res.match[1];
    if (session) {
      switch (session.step) {
        case 1:
          if (anwser.match(/\d+/)) {
            session.far = parseInt(anwser.match(/\d+/)[0]);
            if (session.far < 0 || session.far > 100000) {
              res.send(`你逗我呢？距离只支持 0 - 100000`);
              return;
            }
            session.step++;
            res.send(getQuestionBySession(session));
          } else {
            res.send(`距离需要是一个数字`);
          }
          break;
        case 2:
          if (anwser.match(/\d+/)) {
            session.price = parseInt(anwser.match(/\d+/)[0]);
            if (session.price < 0 || session.price > 1000) {
              res.send(`你逗我呢？人均价格只支持 0 - 1000`);
              return;
            }
            session.step++;
            res.send(`**${session.name}** 添加成功：距离 ${session.far} 米，人均 ${session.price} 元`);
            const data = loadData();
            data[session.name] = session;
            saveData(data);
            createSessions[res.message.user.id] = null;
          } else {
            res.send(`价格需要是一个数字`);
          }
          break;
      }
    }
  });


  robot.respond(/吃啥 list/i, (res) => {
    const data = loadData();
    const restaurants = Object.values(data);
    if (restaurants.length) {
      res.send(`当前餐厅列表：\n` + restaurants.map(renderRestaurant).join("\n"));
    } else {
      res.send("还没有餐厅数据，跟我说： 吃啥 add `餐厅名称` 来添加餐厅");
    }
  });

  robot.respond(/吃啥 rank (.+) (\d+)/i, (res) => {
    const uid = res.message.user.id;
    const data = loadData();
    const name = res.match[1].trim();
    const rank = parseInt(res.match[2]);
    const restaurant = data[name];
    if (!restaurant) {
      res.send("没有收录这家餐厅");
      return;
    }
    if (rank > 10) {
      res.send("打分的数字为 0 - 10");
      return;
    }
    restaurant.ranks[uid] = rank;
    saveData(data);
    res.send(`已更新 ${renderMembers([uid])} 对 ${restaurant.name} 的评分: ${rank}`);
  });


  robot.respond(/吃啥 add (.+)/i, (res) => {
    const name = res.match[1];
    if (name.length > 20) {
      res.send("名字真有那么长？ 骗人");
      return;
    }
    const data = loadData();
    const restaurant = data[name];
    if (restaurant) {
      res.send(`${name} 已经在列表里` );
      return;
    }
    createSessions[res.message.user.id] = {
      name,
      step: 1,
      ranks: {},
      deletors: []
    };
    const session = createSessions[res.message.user.id];
    res.send(`开始添加新美食备选: ${session.name}`);
    setTimeout(function() {
      res.send(getQuestionBySession(session));
    }, 400) // 为了减少回答者的压力，有一个说话的节奏
  });

  robot.respond(/吃啥 del (.+)/i, (res) => {
    const DELETORS_COUNT = 2;
    const uid = res.message.user.id;
    const data = loadData();
    const name = res.match[1].trim();
    const restaurant = data[name];
    if (!restaurant) {
      res.send("没有收录这家餐厅");
      return;
    }
    restaurant.deletors = restaurant.deletors ? restaurant.deletors.concat(uid) : [uid];
    saveData(data);
    if (getDeletors(restaurant).length >= DELETORS_COUNT) {
      delete data[name]
      res.send(`餐厅 ${name} 已删除`);
      saveData(data);
    } else {
      res.send(`还需要 ${DELETORS_COUNT - getDeletors(restaurant).length} 人同意删除这个餐厅`);
    }
  });

  robot.respond(/吃啥 halal (.+)/i, (res) => {
    const uid = res.message.user.id;
    const data = loadData();
    const name = res.match[1].trim();
    const restaurant = data[name];
    if (!restaurant) {
      res.send("没有收录这家餐厅");
      return;
    }
    restaurant.halal = !restaurant.halal;
    saveData(data);
    res.send(`已标记 ${name} 为 ${restaurant.halal ? "" : "非"}清真餐厅`);
  });
}
