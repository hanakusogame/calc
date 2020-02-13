"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Config_1 = require("./Config");
var Button_1 = require("./Button");
/* tslint:disable: align */
var MainScene = /** @class */ (function (_super) {
    __extends(MainScene, _super);
    function MainScene(param) {
        var _this = this;
        param.assetIds = [
            "img_numbers_n", "img_numbers_n_red", "title", "start", "finish", "score", "time", "state", "state2",
            "config", "volume", "test", "glyph72", "number_w", "number_b",
            "se_start", "se_timeup", "bgm", "se_clear", "se_correct", "se_miss", "se_finish", "se_type"
        ];
        _this = _super.call(this, param) || this;
        var tl = require("@akashic-extension/akashic-timeline");
        var timeline = new tl.Timeline(_this);
        var timeline2 = new tl.Timeline(_this);
        var isDebug = false;
        _this.loaded.add(function () {
            g.game.vars.gameState = { score: 0 };
            // 何も送られてこない時は、標準の乱数生成器を使う
            var random = g.game.random;
            var isStart = false;
            _this.message.add(function (msg) {
                if (msg.data && msg.data.type === "start" && msg.data.parameters) {
                    var sessionParameters = msg.data.parameters;
                    if (sessionParameters.randomSeed != null) {
                        // プレイヤー間で共通の乱数生成器を生成
                        // `g.XorshiftRandomGenerator` は Akashic Engine の提供する乱数生成器実装で、 `g.game.random` と同じ型。
                        random = new g.XorshiftRandomGenerator(sessionParameters.randomSeed);
                    }
                }
            });
            // 配信者のIDを取得
            _this.lastJoinedPlayerId = "";
            g.game.join.add(function (ev) {
                _this.lastJoinedPlayerId = ev.player.id;
            });
            // 背景
            var bg = new g.FilledRect({ scene: _this, width: 640, height: 360, cssColor: "gray", opacity: 0 });
            _this.append(bg);
            if ((typeof window !== "undefined" && window.RPGAtsumaru) || isDebug) {
                bg.opacity = 1.0;
                bg.modified();
            }
            bg.hide();
            var bg2 = new g.FilledRect({ scene: _this, width: 640, height: 360, cssColor: "gray", opacity: 0.5 });
            _this.append(bg2);
            var base = new g.E({ scene: _this });
            _this.append(base);
            base.hide();
            var uiBase = new g.E({ scene: _this });
            _this.append(uiBase);
            uiBase.hide();
            //タイトル
            var sprTitle = new g.Sprite({ scene: _this, src: _this.assets["title"], x: 70 });
            _this.append(sprTitle);
            timeline.create(sprTitle, {
                modified: sprTitle.modified, destroyd: sprTitle.destroyed
            }).wait(5000).moveBy(-800, 0, 200).call(function () {
                bg.show();
                base.show();
                uiBase.show();
                isStart = true;
                reset();
            });
            var glyph = JSON.parse(_this.assets["test"].data);
            var numFont = new g.BitmapFont({
                src: _this.assets["img_numbers_n"],
                map: glyph.map,
                defaultGlyphWidth: glyph.width,
                defaultGlyphHeight: glyph.height,
                missingGlyph: glyph.missingGlyph
            });
            var numFontRed = new g.BitmapFont({
                src: _this.assets["img_numbers_n_red"],
                map: glyph.map,
                defaultGlyphWidth: glyph.width,
                defaultGlyphHeight: glyph.height,
                missingGlyph: glyph.missingGlyph
            });
            glyph = JSON.parse(_this.assets["glyph72"].data);
            var numFontW = new g.BitmapFont({
                src: _this.assets["number_w"],
                map: glyph.map,
                defaultGlyphWidth: 65,
                defaultGlyphHeight: 80
            });
            glyph = JSON.parse(_this.assets["glyph72"].data);
            var numFontB = new g.BitmapFont({
                src: _this.assets["number_b"],
                map: glyph.map,
                defaultGlyphWidth: 72,
                defaultGlyphHeight: 80
            });
            //問題数
            uiBase.append(new g.Sprite({ scene: _this, src: _this.assets["score"], x: 90, y: 5, height: 32, srcY: 32 }));
            var labelStage = new g.Label({
                scene: _this,
                x: 0,
                y: 5,
                width: 90,
                fontSize: 32,
                font: numFont,
                text: "1",
                textAlign: g.TextAlign.Right, widthAutoAdjust: false
            });
            uiBase.append(labelStage);
            //スコア
            uiBase.append(new g.Sprite({ scene: _this, src: _this.assets["score"], x: 370, y: 5, height: 32 }));
            var score = 0;
            var labelScore = new g.Label({
                scene: _this,
                x: 282,
                y: 5,
                width: 32 * 10,
                fontSize: 32,
                font: numFont,
                text: "0P",
                textAlign: g.TextAlign.Right, widthAutoAdjust: false
            });
            uiBase.append(labelScore);
            //正解数
            var cntCorrect = 0;
            uiBase.append(new g.Sprite({ scene: _this, src: _this.assets["state2"], x: 150, y: 5, width: 32, height: 32 }));
            var labelCorrect = new g.Label({
                scene: _this,
                x: 175,
                y: 5,
                width: 32 * 3,
                fontSize: 32,
                font: numFont,
                text: "0",
                textAlign: g.TextAlign.Center, widthAutoAdjust: false
            });
            uiBase.append(labelCorrect);
            //不正解数
            var cntMiss = 0;
            uiBase.append(new g.Sprite({ scene: _this, src: _this.assets["state2"], x: 270, y: 5, srcX: 32, width: 32, height: 32 }));
            var labelMiss = new g.Label({
                scene: _this,
                x: 300,
                y: 5,
                width: 32 * 2,
                fontSize: 32,
                font: numFont,
                text: "10",
                textAlign: g.TextAlign.Center, widthAutoAdjust: false
            });
            uiBase.append(labelMiss);
            //タイム
            uiBase.append(new g.Sprite({ scene: _this, src: _this.assets["time"], x: 540, y: 320 }));
            var labelTime = new g.Label({ scene: _this, font: numFont, fontSize: 32, text: "70", x: 580, y: 323 });
            uiBase.append(labelTime);
            //開始
            var sprStart = new g.Sprite({ scene: _this, src: _this.assets["start"], x: 50, y: 100 });
            uiBase.append(sprStart);
            sprStart.hide();
            //終了
            var finishBase = new g.E({ scene: _this, x: 0, y: 0 });
            _this.append(finishBase);
            finishBase.hide();
            var finishBg = new g.FilledRect({ scene: _this, width: 640, height: 360, cssColor: "#000000", opacity: 0.3 });
            finishBase.append(finishBg);
            var sprFinish = new g.Sprite({ scene: _this, src: _this.assets["finish"], x: 120, y: 100 });
            finishBase.append(sprFinish);
            //最前面
            var fg = new g.FilledRect({ scene: _this, width: 640, height: 360, cssColor: "#ff0000", opacity: 0.0 });
            _this.append(fg);
            //リセットボタン
            var btnReset = new Button_1.Button(_this, ["リセット"], 500, 270, 130);
            if ((typeof window !== "undefined" && window.RPGAtsumaru) || isDebug) {
                finishBase.append(btnReset);
                btnReset.pushEvent = function () {
                    reset();
                };
            }
            //ランキングボタン
            var btnRanking = new Button_1.Button(_this, ["ランキング"], 500, 200, 130);
            if ((typeof window !== "undefined" && window.RPGAtsumaru) || isDebug) {
                finishBase.append(btnRanking);
                btnRanking.pushEvent = function () {
                    window.RPGAtsumaru.experimental.scoreboards.display(1);
                };
            }
            //設定ボタン
            var btnConfig = new g.Sprite({ scene: _this, x: 600, y: 0, src: _this.assets["config"], touchable: true });
            if ((typeof window !== "undefined" && window.RPGAtsumaru) || isDebug) {
                _this.append(btnConfig);
            }
            //設定画面
            var config = new Config_1.Config(_this, 380, 40);
            if ((typeof window !== "undefined" && window.RPGAtsumaru) || isDebug) {
                _this.append(config);
            }
            config.hide();
            btnConfig.pointDown.add(function () {
                if (config.state & 1) {
                    config.show();
                }
                else {
                    config.hide();
                }
            });
            config.bgmEvent = function (num) {
                bgm.changeVolume(0.5 * num);
            };
            config.colorEvent = function (str) {
                bg.cssColor = str;
                bg.modified();
            };
            var bgm = _this.assets["bgm"].play();
            bgm.changeVolume(0.2);
            var paneBase = new g.Pane({ scene: _this, x: 10, y: 40, width: 350, height: 310 });
            base.append(paneBase);
            var mapBase = new g.FilledRect({ scene: _this, x: 0, y: 0, width: 350, height: 310, cssColor: "black" });
            paneBase.append(mapBase);
            //問題
            var formulas = [];
            for (var i = 0; i < 6; i++) {
                var formula = new Formula(_this, numFontW, 0, i * 80);
                mapBase.append(formula);
                formulas.push(formula);
            }
            //解答欄
            var ansArea = new g.Label({
                scene: _this, font: numFontW, fontSize: 60, text: "__", x: 250, y: 83
            });
            mapBase.append(ansArea);
            timeline.create(ansArea, { loop: true })
                .wait(500).call(function () {
                ansArea.opacity = 0;
                ansArea.modified();
            })
                .wait(500).call(function () {
                ansArea.opacity = 1;
                ansArea.modified();
            });
            //マスク
            var maskTop = new g.FilledRect({ scene: _this, x: 0, y: 0, width: 350, height: 80, cssColor: "black", opacity: 0.3 });
            paneBase.append(maskTop);
            var maskBottom = new g.FilledRect({ scene: _this, x: 0, y: 160, width: 350, height: 150, cssColor: "black", opacity: 0.3 });
            paneBase.append(maskBottom);
            //ライン
            var line = new g.FilledRect({ scene: _this, x: 5, y: 150, width: 340, height: 2, cssColor: "white" });
            paneBase.append(line);
            //ボタン
            var formuraCnt = 0;
            var btnBase = new g.E({ scene: _this, x: 380, y: 40 });
            var btns = [];
            for (var y = 0; y < 3; y++) {
                for (var x = 0; x < 3; x++) {
                    btns.push(new NumButton({
                        scene: _this, x: x * 80, y: y * 80, width: 80 - 2, height: 80 - 2, cssColor: "white"
                    }, numFontB, 9 - (y * 3 + (2 - x))));
                    btnBase.append(btns[btns.length - 1]);
                }
            }
            var btn = new NumButton({ scene: _this, x: 0, y: 3 * 80, width: 80 * 2 - 2, height: 70 - 2, cssColor: "white" }, numFontB, 0);
            btnBase.append(btn);
            btns.push(btn);
            base.append(btnBase);
            var isStop = false;
            var bkTween = [];
            btns.forEach(function (b) {
                b.pointDown.add(function () {
                    if (isStop || !isStart)
                        return;
                    b.cssColor = "gray";
                    b.modified();
                    var f = formulas[Math.floor((1 + formuraCnt) % formulas.length)];
                    f.input(b.num);
                    var state = f.calc();
                    if (state === 0 || state === 1) {
                        var wait = (state === 0) ? 500 : 1000;
                        if (state !== 0) {
                            isStop = true;
                        }
                        var _loop_1 = function (i) {
                            var j = Math.floor((i + formuraCnt) % formulas.length);
                            var e = formulas[j];
                            e.y = i * 80;
                            e.modified();
                            timeline.remove(bkTween[i]);
                            bkTween[i] = timeline.create(e, { modified: e.modified, destroyed: e.destroyed })
                                .wait(wait)
                                .call(function () {
                                ansArea.hide();
                            })
                                .moveTo(0, (i - 1) * 80, 200);
                            var num = formuraCnt;
                            timeline.create().wait(wait + 200).call(function () {
                                if (i === 0)
                                    e.hide();
                                if (i === formulas.length - 1) {
                                    var a = list[(num + formulas.length) % 100];
                                    e.reset(a.left, a.right, a.op);
                                    e.show();
                                }
                                ansArea.show();
                                if (state !== 0) {
                                    isStop = false;
                                }
                            });
                        };
                        for (var i = 0; i < formulas.length; i++) {
                            _loop_1(i);
                        }
                        if (state === 0) {
                            addScore(100 + ((f.labelAns.text.length - 1) * 20));
                            cntCorrect++;
                            labelCorrect.text = "" + cntCorrect;
                            labelCorrect.invalidate();
                            _this.assets["se_correct"].play().changeVolume(config.volumes[1]);
                        }
                        else {
                            cntMiss++;
                            labelMiss.text = "" + cntMiss;
                            labelMiss.invalidate();
                            _this.assets["se_miss"].play().changeVolume(config.volumes[1]);
                        }
                        formuraCnt++;
                        labelStage.text = "" + (formuraCnt + 1);
                        labelStage.invalidate();
                    }
                    _this.assets["se_type"].play().changeVolume(config.volumes[1]);
                });
                b.pointUp.add(function () {
                    b.cssColor = "white";
                    b.modified();
                });
            });
            //押したとき
            mapBase.pointDown.add(function (ev) {
                if (!isStart)
                    return;
            });
            //動かしたとき
            mapBase.pointMove.add(function (ev) {
                if (!isStart)
                    return;
            });
            mapBase.pointUp.add(function (ev) {
                if (!isStart)
                    return;
            });
            //メインループ
            var bkTime = 0;
            var timeLimit = 70;
            var startTime = 0;
            _this.update.add(function () {
                //return;//デバッグ用
                if (!isStart)
                    return;
                var t = timeLimit - Math.floor((Date.now() - startTime) / 1000);
                //終了処理
                if (t <= -1) {
                    fg.cssColor = "#000000";
                    fg.opacity = 0.0;
                    fg.modified();
                    finishBase.show();
                    isStart = false;
                    _this.assets["se_timeup"].play().changeVolume(config.volumes[1]);
                    timeline.create().wait(1500).call(function () {
                        if (typeof window !== "undefined" && window.RPGAtsumaru) {
                            window.RPGAtsumaru.experimental.scoreboards.setRecord(1, g.game.vars.gameState.score).then(function () {
                                btnRanking.show();
                                btnReset.show();
                            });
                        }
                        if (isDebug) {
                            btnRanking.show();
                            btnReset.show();
                        }
                    });
                    return;
                }
                labelTime.text = "" + t;
                labelTime.invalidate();
                if (bkTime !== t && t <= 5) {
                    fg.opacity = 0.1;
                    fg.modified();
                    timeline.create().wait(500).call(function () {
                        fg.opacity = 0.0;
                        fg.modified();
                    });
                }
                bkTime = t;
            });
            //スコア加算表示
            var addScore = function (num) {
                if (score + num < 0) {
                    num = -score;
                }
                score += num;
                timeline.create().every(function (e, p) {
                    labelScore.text = "" + (score - Math.floor(num * (1 - p))) + "P";
                    labelScore.invalidate();
                }, 300);
                g.game.vars.gameState.score = score;
            };
            var list = [];
            //リセット
            var reset = function () {
                bkTime = 0;
                startTime = Date.now();
                isStart = true;
                score = 0;
                labelScore.text = "0P";
                labelScore.invalidate();
                sprStart.show();
                timeline.create().wait(750).call(function () {
                    sprStart.hide();
                });
                btnReset.hide();
                btnRanking.hide();
                fg.opacity = 0;
                fg.modified();
                formuraCnt = 0;
                labelStage.text = "1";
                labelStage.invalidate();
                list.length = 0;
                for (var i = 0; i < 100; i++) {
                    var op = random.get(0, 3);
                    if (i !== 0) {
                        while (op === list[i - 1].op) {
                            op = random.get(0, 3);
                        }
                    }
                    if (op === 3) {
                        while (true) {
                            var left = random.get(1, 9);
                            var right = random.get(1, 9);
                            if ((left % right) === 0) {
                                list.push({ left: left, right: right, op: op });
                                break;
                            }
                        }
                    }
                    else if (op === 1) {
                        var left = random.get(0, 9);
                        var right = random.get(0, 9);
                        if (left < right) {
                            _a = [right, left], left = _a[0], right = _a[1];
                        }
                        list.push({ left: left, right: right, op: op });
                    }
                    else {
                        var left = random.get(0, 9);
                        var right = random.get(0, 9);
                        list.push({ left: left, right: right, op: op });
                    }
                }
                for (var i = 0; i < formulas.length; i++) {
                    var e = list[i];
                    formulas[i].y = i * 80;
                    formulas[i].reset(e.left, e.right, e.op);
                    formulas[i].show();
                }
                formulas[0].hide();
                formulas[formulas.length - 1].hide();
                cntCorrect = 0;
                labelCorrect.text = "0";
                labelCorrect.invalidate();
                cntMiss = 0;
                labelMiss.text = "0";
                labelMiss.invalidate();
                finishBase.hide();
                startTime = Date.now();
                _this.assets["se_start"].play().changeVolume(config.volumes[1]);
                var _a;
            };
        });
        return _this;
    }
    return MainScene;
}(g.Scene));
exports.MainScene = MainScene;
//計算式表示と計算処理
var Formula = /** @class */ (function (_super) {
    __extends(Formula, _super);
    function Formula(scene, font, x, y) {
        var _this = _super.call(this, { scene: scene, x: x, y: y }) || this;
        _this.left = 0;
        _this.right = 0;
        _this.op = 0;
        _this.opStr = ["+", "-", "*", "/"];
        _this.ans = 0;
        _this.label = new g.Label({ scene: scene, font: font, fontSize: 60, text: "", x: 55, y: 5 });
        _this.append(_this.label);
        _this.labelAns = new g.Label({ scene: scene, font: font, fontSize: 60, text: "", x: 250, y: 5 });
        _this.append(_this.labelAns);
        _this.sprState = new g.FrameSprite({
            scene: scene,
            src: scene.assets["state"],
            width: 60,
            height: 60,
            y: 5,
            frames: [0, 1]
        });
        _this.append(_this.sprState);
        return _this;
    }
    Formula.prototype.reset = function (left, right, op) {
        this.left = left;
        this.right = right;
        this.op = op;
        this.label.text = "" + left + this.opStr[op] + right + "=";
        this.label.invalidate();
        this.sprState.hide();
        if (op === 0) {
            this.ans = left + right;
        }
        else if (op === 1) {
            this.ans = left - right;
        }
        else if (op === 2) {
            this.ans = left * right;
        }
        else if (op === 3) {
            this.ans = left / right;
        }
        this.labelAns.text = "";
        this.labelAns.invalidate();
    };
    Formula.prototype.input = function (i) {
        this.labelAns.text += "" + i;
        this.labelAns.invalidate();
    };
    //計算結果を返す(0: 正解, 1:不正解, 2:途中)
    Formula.prototype.calc = function () {
        var returnNum = 0;
        var ans = parseInt(this.labelAns.text, 10);
        if (Math.floor(this.ans / 10) !== 0 && Math.floor(ans / 10) === 0) {
            if (Math.floor(this.ans / 10) === ans) {
                returnNum = 2;
            }
            else {
                returnNum = 1;
            }
        }
        else {
            if (this.ans === ans) {
                returnNum = 0;
            }
            else {
                returnNum = 1;
            }
        }
        this.sprState.frameNumber = returnNum;
        this.sprState.modified();
        this.sprState.show();
        return returnNum;
    };
    return Formula;
}(g.E));
//数字ボタン
var NumButton = /** @class */ (function (_super) {
    __extends(NumButton, _super);
    function NumButton(param, font, num) {
        var _this = _super.call(this, param) || this;
        _this.num = 0;
        _this.touchable = true;
        _this.num = num;
        _this.append(new g.Label({
            scene: param.scene, font: font, fontSize: 60, text: "" + num, x: 0, y: 10, width: _this.width,
            widthAutoAdjust: false, textAlign: g.TextAlign.Center
        }));
        return _this;
    }
    return NumButton;
}(g.FilledRect));
