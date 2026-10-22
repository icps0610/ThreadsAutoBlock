// ==UserScript==
// @name         [ threads ] 自動封鎖，進入個人檔案就開始進行封鎖，若為「解除封鎖」則自動中止
// @namespace    http://tampermonkey.net/
// @version      2.5
// @description  [ threads ] 自動封鎖，進入個人檔案就開始進行封鎖，若為「解除封鎖」則自動中止
// @author       Gemini User
// @match        https://www.threads.com/@*
// @grant        none
// @icon         https://www.google.com/s2/favicons?sz=64&domain=www.threads.com
// ==/UserScript==

(function() {
    'use strict';

    const CONFIG = {
        // 步驟 1 多組備用選擇器
        selectorsA: [
            '#barcelona-page-layout > div > div > div.x78zum5.xdt5ytf.x1iyjqo2.x2lwn1j.x6ikm8r.x10wlt62 > div > div.x78zum5.xdt5ytf.x1iyjqo2.x1n2onr6 > div.x1a8lsjc.xyamay9.x8tz501.x1rdv6da.xs4q6k7.xm3mpkm > div.x6s0dn4.x78zum5.x14vqqas.xu0aao5 > div.x6s0dn4.x78zum5.x1c4vz4f.x2lah0s.x1ws5yxj > div.x78zum5.x13a6bvl.xh8yej3 > div > div > svg',
            '#barcelona-page-layout > div > div > div > div.x1a8lsjc.xyamay9.x8tz501.x1rdv6da.xs4q6k7.xm3mpkm > div.x6s0dn4.x78zum5.x14vqqas.xu0aao5 > div.x6s0dn4.x78zum5.x1c4vz4f.x2lah0s.x1ws5yxj > div.x78zum5.x13a6bvl.xh8yej3 > div > div > svg',
            'svg[aria-label="更多"]',
            'svg[aria-label="More"]',
            'div[role="button"] svg[aria-label="更多"]',
            'div[role="button"] svg[aria-label="More"]'
        ],

        // 步驟 2 備用選擇器（包含最新路徑）
        selectorsB: [
            'div[id^="mount_0_0_"] > div > div > div:nth-child(3) > div > div:nth-child(2) > div.x9f619.x1n2onr6.x1ja2u2z > div > div.x1uvtmcs.x4k7w5x.x1h91t0o.x1beo9mf.xaigb6o.x12ejxvf.x3igimt.xarpa2k.xedcshv.x1lytzrv.x1t2pt76.x7ja8zs.x1n2onr6.x1qrby5j.x1jfb8zj > div > div > div > div > div > div > div > div > div > div.x9f619.x1ja2u2z.x1k90msu.x6o7n8i.x1qfuztq.x1o0tod.x10l6tqk.x13vifvy.x1hc1fzr.x71s49j.xh8yej3 > div:nth-child(3) > div:nth-child(1) > div.x6s0dn4.x78zum5.x1szn6h9.x6ikm8r.x10wlt62.x1n2onr6.xlyipyv.xuxw1ft.x1qrby5j.x1vjfegm > div.x78zum5.xdt5ytf.x1iyjqo2.x6ikm8r.x10wlt62.xlyipyv.xuxw1ft > div > span > span',
            'div[id^="mount_0_0_"] > div > div > div.x1uy002k > div.x2busnq > div > div > div > div:nth-child(2) > div > div > div.xu96u03.xm80bdy.x10l6tqk.x13vifvy > div.x1uvtmcs.x4k7w5x.x1h91t0o.x1beo9mf.xaigb6o.x12ejxvf.x3igimt.xarpa2k.xedcshv.x1lytzrv.x1t2pt76.x7ja8zs.x1n2onr6.x1qrby5j.x1jfb8zj > div > div > div > div > div > div.x9f619.x1ja2u2z.x1k90msu.x6o7n8i.x1qfuztq.x1o0tod.x10l6tqk.x13vifvy.x1hc1fzr.x71s49j.xh8yej3 > div:nth-child(3) > div > div:nth-child(1) > div.x6s0dn4.x78zum5.x1szn6h9.x6ikm8r.x10wlt62.x1n2onr6.xlyipyv.xuxw1ft.x1qrby5j.x1vjfegm.x1hshjfz > div.x78zum5.xdt5ytf.x1iyjqo2.x6ikm8r.x10wlt62.xlyipyv.xuxw1ft > div'
        ],

        // 步驟 3 (Confirm Button)
        selectorC: 'div[id^="mount_0_0_"] > div > div > div:nth-child(3) > div > div > div.x9f619.x1n2onr6.x1ja2u2z > div > div.x1uvtmcs.x4k7w5x.x1h91t0o.x1beo9mf.xaigb6o.x12ejxvf.x3igimt.xarpa2k.xedcshv.x1lytzrv.x1t2pt76.x7ja8zs.x1n2onr6.x1qrby5j.x1jfb8zj > div > div > div > div.html-div.xdj266r.x14z9mp.xat24cr.x1lziwak.xexx8yu.xyri2b.x18d9i69.x1c1uobl.x6s0dn4.x78zum5.xl56j7k.x1n2onr6.x1vjfegm > div > div > div > div.xz6dhga.x13fuv20.x178xt8z.x78zum5.x15zctf7.xh8yej3 > div.x1i10hfl.xjbqb8w.xjqpnuy.xc5r6h4.xqeqjp1.x13fuv20.x18b5jzi.x1q0q8m5.x972fbf.x10w94by.x1qhh985.x9f619.x1ypdohk.x2lah0s.x3ct3a4.xdj266r.x14z9mp.xat24cr.x1lziwak.x2lwn1j.xeuugli.xexx8yu.xyri2b.x18d9i69.x1c1uobl.x1n2onr6.x16tdsg8.x1hl2dhg.xggy1nq.x1ja2u2z.x1t137rt.x1fmog5m.xu25z0z.xo1y3bh.x1q0g3np.x87ps6o.x1lku1pv.x1a2a7pz.x6s0dn4.x78zum5.x1iyjqo2.x1dnml7z.xl56j7k.x18xmwgd.xpp8er5.x121z25r.x1t7ytsu.xpilrb4 > div.x17zd0t2.x78zum5.xf159sx.xmzvs34.x1vjfegm',

        initialDelay: 1000,
        delay: 900,
        checkInterval: 500,
        maxRetries: 60,
        abortText: '解除封鎖',
        targetActionText: '封鎖'
    };

    let hasExecuted = false;
    let initTimer = null;

    function log(msg, type = 'info') {
        const prefix = '[Threads-AutoBlock]';
        if (type === 'error') console.error(`${prefix} ❌ ${msg}`);
        else if (type === 'warn') console.warn(`${prefix} ⚠️ ${msg}`);
        else console.log(`${prefix} ℹ️ ${msg}`);
    }

    function triggerClick(element, name) {
        if (!element) {
            log(`無法點擊：${name} 不存在`, 'error');
            return false;
        }

        try {
            element.click();
        } catch (e) {
            log(`呼叫 .click() 失敗，改用事件派送: ${e.message}`, 'warn');
        }

        const events = ['mousedown', 'mouseup', 'click'];
        events.forEach(eventType => {
            const event = new MouseEvent(eventType, {
                view: window,
                bubbles: true,
                cancelable: true
            });
            element.dispatchEvent(event);
        });

        log(`已觸發點擊事件：${name}`);
        return true;
    }

    // 取得步驟 1 元素
    function getStep1Element() {
        for (const sel of CONFIG.selectorsA) {
            const el = document.querySelector(sel);
            if (el) {
                return el.closest('[role="button"]') || el.parentElement || el;
            }
        }

        const svgs = document.querySelectorAll('#barcelona-page-layout svg');
        for (const svg of svgs) {
            if (svg.querySelectorAll('circle').length === 3) {
                return svg.closest('[role="button"]') || svg.parentElement || svg;
            }
        }

        return null;
    }

    // 取得步驟 2 元素（優先文字內容掃描，備援特定選擇器）
    function getStep2Element() {
        // 優先搜尋選單清單中的所有項目文字，避開動態巢狀層級問題
        const menuItems = document.querySelectorAll('div[id^="mount_0_0_"] div[role="menuitem"], div[id^="mount_0_0_"] div[role="button"], div[id^="mount_0_0_"] span');
        for (const item of menuItems) {
            const text = (item.textContent || item.innerText || '').trim();
            if (text === CONFIG.abortText || text === CONFIG.targetActionText || text.startsWith(CONFIG.targetActionText)) {
                return item.closest('[role="menuitem"]') || item.closest('[role="button"]') || item;
            }
        }

        // 選擇器路徑備援
        for (const sel of CONFIG.selectorsB) {
            const el = document.querySelector(sel);
            if (el) {
                return el.closest('[role="menuitem"]') || el.closest('[role="button"]') || el;
            }
        }

        return null;
    }

    // 取得步驟 3 元素（確認按鈕）
    function getStep3Element() {
        const dialogButtons = document.querySelectorAll('div[id^="mount_0_0_"] div[role="dialog"] div[role="button"], div[id^="mount_0_0_"] div[role="button"]');
        for (const btn of dialogButtons) {
            const text = (btn.textContent || btn.innerText || '').trim();
            if (text === CONFIG.targetActionText || text.includes(CONFIG.targetActionText)) {
                return btn;
            }
        }

        return document.querySelector(CONFIG.selectorC);
    }

    function startAutomation() {
        if (hasExecuted) return;

        log(`開始尋找步驟 1 目標元素... (檢查間隔: ${CONFIG.checkInterval}ms, 上限: ${CONFIG.maxRetries}次)`);
        let retryCount = 0;

        const intervalId = setInterval(() => {
            const el1 = getStep1Element();

            if (el1) {
                clearInterval(intervalId);
                hasExecuted = true;
                log('找到步驟 1 元素，開始執行序列');
                executeSequence(el1);
            } else {
                retryCount++;
                if (retryCount % 10 === 0) {
                    log(`嘗試尋找步驟 1 元素中... (${retryCount}/${CONFIG.maxRetries})`);
                }
                if (retryCount >= CONFIG.maxRetries) {
                    clearInterval(intervalId);
                    log(`超時：找不到步驟 1 元素`, 'error');
                }
            }
        }, CONFIG.checkInterval);
    }

    function executeSequence(el1) {
        // STEP 1
        triggerClick(el1, '步驟 1 (選單按鈕)');

        // STEP 2
        setTimeout(() => {
            log('正在尋找步驟 2 元素...');
            const el2 = getStep2Element();

            if (!el2) {
                log(`找不到步驟 2 元素`, 'error');
                return;
            }

            const itemText = (el2.textContent || el2.innerText || '').trim();
            log(`步驟 2 元素取得文字內容: "${itemText}"`);

            if (itemText.includes(CONFIG.abortText)) {
                log(`偵測到關鍵字「${CONFIG.abortText}」，中止操作。`);
                return;
            }

            triggerClick(el2, '步驟 2 (選單項目)');

            // STEP 3
            setTimeout(() => {
                log('正在尋找步驟 3 元素...');
                const el3 = getStep3Element();

                if (!el3) {
                    log(`找不到步驟 3 元素`, 'error');
                    return;
                }

                log(`步驟 3 元素取得文字內容: "${(el3.textContent || el3.innerText || '').trim()}"`);
                triggerClick(el3, '步驟 3 (確認按鈕)');
                log('點擊序列全數完成');

            }, CONFIG.delay);

        }, CONFIG.delay);
    }

    function init() {
        if (initTimer) return;
        log(`腳本啟動，等待初始延遲 ${CONFIG.initialDelay}ms... 當前網址: ${window.location.href}`);
        initTimer = setTimeout(() => {
            startAutomation();
        }, CONFIG.initialDelay);
    }

    if (document.readyState === 'loading') {
        window.addEventListener('load', init);
    } else {
        init();
    }

})();
