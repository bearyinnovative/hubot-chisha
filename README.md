# hubot-chisha

This script help you choose a restaurant for lunch or dinner.

NOTE: this sciprt supprt hubot-bearychat adapter only. universal support and english version coming soon.

See [`src/chisha.js`](src/chisha.js) for full documentation.

## Installation

### Prepare

Please prepare hubot-bearychat according to the doc [hubot-bearychat](https://github.com/bearyinnovative/hubot-bearychat) first.

### Install

In hubot project repo, run:

`npm install hubot-chisha --save`

Then add **hubot-chisha** to your `external-scripts.json`:

```json
[
  "hubot-chisha"
]
```

## Sample Interaction

```
user>> 吃啥 help
hubot>> 吃啥相关暗语说明：
         1. 吃啥 roll [近/便宜/老板请客/清真/好吃] => 获得专业美食推荐
         2. 吃啥 list => 获得当前美食列表
         3. 吃啥 add [name] => 添加新餐厅
         4. 吃啥 rank [name] [n] => 给某餐厅打分(0 - 10)
         5. 吃啥 del [name] => 删除餐厅(需要两个人同意)
         6. 吃啥 halal [name] => 标记餐厅为清真餐厅
user>> 吃啥 add 肯德基
hubot>> 开始添加新美食备选: 肯德基
        去这家 肯德基 有多远？(单位：米)
user>> 500
hubot>> 这家 肯德基 人均价格是多少？(单位：元)
user>> 25
hubot>> 肯德基 添加成功：距离 500 米，人均 25 元
user>> 吃啥 roll
hubot>> 我给出的选择是：
        肯德基 平均分: 5, 距离: 500 米，人均: 25 元
```
## Setup

set environment variable `HUBOT_CHISHA_JSON_FILE="a json file path that store all data"`
(optional, otherwise hubot will use his brain)

## NPM Module

https://www.npmjs.com/package/hubot-chisha
