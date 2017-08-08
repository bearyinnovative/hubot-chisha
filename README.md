# hubot-chisha

This script help you choose a restaurant for lunch or dinner.

NOTE: this sciprt supprt hubot-bearychat adapter only. universal support and english version coming soon.

See [`src/chisha.js`](src/chisha.js) for full documentation.

## Installation

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
user>> 吃啥 roll
hubot>> 我给出的选择是：
        萨利亚 距离：100 米  人均：30 元  评分：7.3
user>> 吃啥 help
```
## Setup

set environment variable `HUBOT_CHISHA_JSON_FILE="a json file path that store all data"`
(optional, otherwise hubot will use his brain)

## NPM Module

https://www.npmjs.com/package/hubot-chisha
