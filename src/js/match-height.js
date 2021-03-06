export function matchHeight() {
  'use strict';

  /**
   * 高さ揃え機能 
   * @constructor
   * @param {object} root ルートにあたるDOM要素
   */
  const MatchHeight = function (root) {
    this.root = root;
    this.matchHeightItem = this.root.querySelectorAll(this.root.getAttribute('data-align-target'));
    this.targetChildAry = this.root.getAttribute('data-target-child').replace(/\s/g, '').replace(/\./g, '').split(',');
    this.rows = null;
    this.threshold = 100;
  };

  MatchHeight.prototype = {
    /**
     * 参照する関数を実行
     * @returns {void}
     */
    init: function () {
      this.resizeHundler();
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 10);
    },

    /**
     * ウィンドウリサイズ時の処理
     * @return {void}
     */
    resizeHundler: function () {
      let timeOutId = null;

      window.addEventListener('resize', () => {
        if (timeOutId) {
          return;
        }

        timeOutId = setTimeout(() => {
          timeOutId = 0;
          this.removeHeight();
          this.setRowsAry();
          this.setHeights();
        }, this.threshold);
      }, false);
    },

    /**
     * リサイズ開始時に子要素に設定していたheightを削除
     * return {void}
     */
    removeHeight: function () {
      this.matchHeightItem.forEach(item => {
        let i = 0;
        let target = null;

        for (; i < this.targetChildAry.length; i++) {
          target = item.querySelector('.' + this.targetChildAry[i]);
          target.style.height = '';
        }
      });
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
      setTimeout(() => {
        this.matchHeightItem.forEach(item => {
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
      setTimeout(() => {
        this.matchHeightItem.forEach(item => {
          let dataTop = item.getAttribute('data-top');
          rows['row' + dataTop].push(item);
          item.removeAttribute('data-top');
        });
        this.rows = rows;
      }, 2);
    },

    /**
     * 配置Y軸が同一にある要素の各要素の高さを揃える
     * @returns {void}
     */
    setHeights: function () {
      for (let rowsKey in this.rows) {
        const heights = {};

        const setSortHeights = () => {
          return new Promise(resolve => {

            // 配置Y軸が同一にあるwrapperを順に処理
            this.rows[rowsKey].forEach(item => {
              let i = 0;

              // wrapper内の高さを揃える子要素の高さを順に取得
              for (; i < this.targetChildAry.length; i++) {
                let targetHeight = item.querySelector('.' + this.targetChildAry[i]).offsetHeight;

                // heightsに該当のclass名プロパティが存在しなければ生成し、空の配列を挿入
                if (!heights[this.targetChildAry[i]]) {
                  heights[this.targetChildAry[i]] = [];
                }

                // 子要素のclass名と同一のプロパティに高さの値を追加
                heights[this.targetChildAry[i]].push(targetHeight);
              }
            });
            resolve();
          });
        };

        setSortHeights().then(() => {
          const classesKeyAry = [];
          const rowsKeyAry = [];

          for (let heightsKey in heights) {
            heights[heightsKey].sort(this.sortAry);
            classesKeyAry.push([heightsKey]);
          }

          rowsKeyAry.push([rowsKey]);

          this.rows[rowsKeyAry[0]].forEach(item => {
            let i = 0;
            let target = null;

            for (; i < classesKeyAry.length; i++) {
              target = item.querySelector('.' + classesKeyAry[i])
              target.style.height = heights[classesKeyAry[i]][0] + 'px';
            }
          })
        });
      }
    },

    /**
     * 配列内のNumberを大きい順にソートする
     * @param {Array} a ソートされる数値
     * @param {Array} b ソートされる数値
     */
    sortAry: function (a, b) {
      return b - a;
    },
  };

  // 機能実行
  document.querySelectorAll('.js-match-height').forEach(function (element) {
    let matchHeight = new MatchHeight(element);
    matchHeight.init();
  });
}
