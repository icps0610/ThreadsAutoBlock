// ==UserScript==
// @name        [ Threads ] 展開 Threads 縮寫網址
// @namespace   http://tampermonkey.net/
// @version     1.2
// @description [ Threads ] 展開 Threads 縮寫網址
// @match       *://*.threads.com/*
// @grant       none
// @icon        https://www.google.com/s2/favicons?sz=64&domain=www.threads.com
// ==/UserScript==

(function() {
    'use strict';

    function cleanUrl(rawUrl) {
        // 移除網址中的查詢參數與雜湊值
        return rawUrl.split('?')[0].split('#')[0];
    }

    function expandUrls() {
        const links = document.querySelectorAll('a[role="link"]');
        for (let i = 0; i < links.length; i++) {
            const link = links[i];
            const href = link.getAttribute('href');
            if (!href) continue;

            const span = link.querySelector('span[translate="no"]');
            if (span && span.textContent.includes('…')) {
                if (href.startsWith('/@')) {
                    // 針對使用者帳號的相對路徑進行還原並移除參數
                    span.textContent = cleanUrl('https://www.threads.com' + href);
                } else if (href.startsWith('https://www.threads.com/@')) {
                    // 針對完整的使用者帳號路徑進行還原並移除參數
                    span.textContent = cleanUrl(href);
                }
            }
        }
    }

    // 建立 MutationObserver 監聽 DOM 變化（針對動態載入的網頁）
    const observer = new MutationObserver(() => {
        expandUrls();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // 初始執行一次
    expandUrls();
})();
