export function matchHeight() {
  'use strict';

  setMatchHeight('.js-match-height', {
    isFlex: false
  });

  /**
   * 高さ揃え機能
   * @param {Object} rootEl 高さ揃えを行う要素のroot
   * @param {Object} options オプション
   */
  function setMatchHeight(rootEl, options) {
    const rootElement = document.querySelectorAll(rootEl);
    let o = {
      sp: true,
      isFlex: true,
    };

    if (options) {
      for (let key in options) {
        o[key] = options[key];
      }
    }

    return rootElement.forEach( root => {
      /**
       * コンストラクター
       * @constructor
       */
      const MatchHeight = function () {
        this.root = root;
        this.matchHeightItem = this.root.querySelectorAll(this.root.getAttribute('data-align-target'));
        this.targetChildAry = this.root.getAttribute('data-target-child').replace(/\s/g, '').replace(/\./g, '').split(',');
        this.rows = null;
        this.threshold = 500;
      };

      MatchHeight.prototype = {
        /**
         * インスタンスをまとめる関数
         * @returns {void}
         */
        init: function () {
          this.resizeHundler();
          setTimeout( () => {
            window.dispatchEvent(new Event('resize'));
          }, 10);
        },

        /**
         * 配置Y軸が同一にある要素を格納する連想配列を定義
         * リサイズの度に処理を行う
         * @return {void}
         */
        setRowsAry: function () {
          let pageYAry = []; // root内の要素ごとのY軸を羅列
          let notDuplicatedAry = []; // pageYAryの重複を削除したリスト、要素の行数とlengthが一致する
          let rows = {}; // Y軸が同一の要素ごとに連想配列として格納
          let i = 0;

          // 本来不要な非同期処理、jsとcssが一体化している場合のみ仮に使用している
          setTimeout( () => {
            this.matchHeightItem.forEach( item => {
              let style = window.getComputedStyle(item);
              let marginTop = parseInt(style.marginTop.replace(/px/, ''));
              let itemYVal = item.getBoundingClientRect().top - marginTop;

              pageYAry.push(itemYVal);
              item.setAttribute('data-top', itemYVal);
            });

            notDuplicatedAry = pageYAry.filter(function (x, i, self) {
              return self.indexOf(x) === i;
            });

            for (; i < notDuplicatedAry.length; i++) {
              rows['row' + notDuplicatedAry[i]] = [];
            }
          }, 1);

          // 本来不要な非同期処理、jsとcssが一体化している場合のみ仮に使用している
          setTimeout( () => {
            this.matchHeightItem.forEach( item => {
              let dataTop = item.getAttribute('data-top');
              rows['row' + dataTop].push(item);
              item.removeAttribute('data-top');
            });
            this.rows = rows;
          }, 2);
        },

        /**
         * ウィンドウリサイズ時の処理
         * @return {void}
         */
        resizeHundler: function () {
          let self = this;
          let timeOutId = null;

          window.addEventListener('resize', () => {
            if (timeOutId) {
              return;
            }

            timeOutId = setTimeout( () => {
              timeOutId = 0;
              self.setRowsAry();
              self.setHeight();
            }, this.threshold);
          }, false);
        },

        /**
         * 各要素の高さを揃える
         * @returns {void}
         */
        setHeight: function () {
          for (let key in this.rows) {
            const self = this;
            const heights = {};

            const setHeights = () => {
              return new Promise ( resolve => {

                // 同水平位置内のdivを順に処理
                self.rows[key].forEach( item => {
                  let i = 0;

                  // div内の高さを揃える子要素を順に処理
                  for (; i < self.targetChildAry.length; i++) {
                    let targetHeight = item.querySelector('.' + self.targetChildAry[i]).offsetHeight;

                    // heightsに該当のプロパティが存在しなければ生成し、空の配列を挿入
                    if (!heights[self.targetChildAry[i]]) {
                      heights[self.targetChildAry[i]] = [];
                    }

                    heights[self.targetChildAry[i]].push(targetHeight);
                  }
                });
                resolve();
              });
            };

            setHeights().then( () => {
              for (let key in heights) {
                let i = 0;
                heights[key].sort(this.sortAry);

                for (; i < heights[key].length; i++) {
                  console.log(this.rows)
                }
              }
            });
          }
        },

        sortAry: function (a, b) {
          return b - a;
        },
      };

      let matchHeight = new MatchHeight();
      matchHeight.init();
    });

  }
}
