// ==UserScript==
// @name         [ threads ] 自動跳轉
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  [ threads ] 在右邊 + 貼上名單 自動辨識帳號與網址 批次跳轉排程器
// @author       Gemini User
// @match        https://www.threads.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-idle
// @icon         https://www.google.com/s2/favicons?sz=64&domain=www.threads.com
// ==/UserScript==

(function() {
    'use strict';

    // 停留秒數設定：每個個人首頁停留多久後跳轉下一筆 (預設 4500 毫秒，確保封鎖腳本動作完成)
    const PAGE_WAIT_TIME = 4500;

    const STORAGE_KEY_QUEUE = 'threads_jump_queue';
    const STORAGE_KEY_RUNNING = 'threads_jump_running';

    function log(msg) {
        console.log(`[Threads-Jumper] ${msg}`);
    }

    // 文字解析：自動拆解未換行網址、辨識 Threads 網址或純帳號
    function parseToThreadsUrls(rawText) {
        // 若多個 https:// 黏在一起，自動在其前方加入換行
        const formattedText = rawText.replace(/(?!^)(https?:\/\/)/g, '\n$1');

        const lines = formattedText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        const timeRegex = /^\d+\s*(小時|分|分鐘|秒|天|週|年|[hmsdwy])/i;
        const usernameRegex = /^[a-zA-Z0-9._]{1,30}$/;

        const urls = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // 1. 若已經是 Threads 網址，保留使用
            if (/^https?:\/\/(www\.)?threads\.(net|com)\/@/i.test(line)) {
                urls.push(line);
                continue;
            }

            // 2. 排除時間格式行
            if (timeRegex.test(line)) continue;

            // 3. 辨識一般帳號格式
            if (usernameRegex.test(line)) {
                const nextLine = lines[i + 1];
                const isFollowedByTime = nextLine && timeRegex.test(nextLine);
                const isFollowedByName = nextLine && !usernameRegex.test(nextLine);

                // 符合帳號位置特徵或是最後一行
                if (isFollowedByTime || isFollowedByName || !nextLine) {
                    const cleanUsername = line.replace(/^@/, '');
                    urls.push(`https://www.threads.com/@${cleanUsername}`);

                    if (isFollowedByTime) i++;
                }
            }
        }

        return [...new Set(urls)];
    }

    // 執行跳轉下一筆
    function jumpToNext() {
        const isRunning = GM_getValue(STORAGE_KEY_RUNNING, false);
        if (!isRunning) return;

        let queue = GM_getValue(STORAGE_KEY_QUEUE, []);

        if (queue.length > 0) {
            const nextUrl = queue.shift();
            GM_setValue(STORAGE_KEY_QUEUE, queue);
            log(`準備跳轉至: ${nextUrl} (剩餘筆數: ${queue.length})`);

            // 使用 replace 強制整頁刷新，觸發另一個封鎖腳本
            window.location.replace(nextUrl);
        } else {
            GM_setValue(STORAGE_KEY_RUNNING, false);
            log('隊列已清空，任務結束');
        }
    }

    // 檢查當前是否在任務中
    function checkQueueStatus() {
        const isRunning = GM_getValue(STORAGE_KEY_RUNNING, false);
        if (!isRunning) return;

        log(`偵測到任務進行中，將停留 ${PAGE_WAIT_TIME / 1000} 秒後跳轉下一筆...`);
        setTimeout(() => {
            jumpToNext();
        }, PAGE_WAIT_TIME);
    }

    // 建立右側面板 UI
    function createUI() {
        if (document.getElementById('threads-jumper-btn')) return;

        // 右側浮動按鈕 [+]
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'threads-jumper-btn';
        toggleBtn.textContent = '+';
        Object.assign(toggleBtn.style, {
            position: 'fixed',
            top: '40%',
            right: '0px',
            transform: 'translateY(-50%)',
            width: '36px',
            height: '36px',
            backgroundColor: '#101010',
            color: '#fff',
            border: '1px solid #444',
            borderRight: 'none',
            borderRadius: '8px 0 0 8px',
            cursor: 'pointer',
            zIndex: '9999999',
            fontSize: '22px',
            lineHeight: '34px',
            textAlign: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.4)'
        });

        // 浮動面板
        const panel = document.createElement('div');
        panel.id = 'threads-jumper-panel';
        Object.assign(panel.style, {
            position: 'fixed',
            top: '40%',
            right: '0px',
            transform: 'translateY(-50%)',
            width: '300px',
            backgroundColor: '#181818',
            color: '#fff',
            border: '1px solid #333',
            borderRadius: '10px 0 0 10px',
            padding: '14px',
            boxSizing: 'border-box',
            display: 'none',
            flexDirection: 'column',
            gap: '10px',
            zIndex: '9999999',
            boxShadow: '0 4px 20px rgba(0,0,0,0.6)'
        });

        // 面板標題列
        const header = document.createElement('div');
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';

        const title = document.createElement('span');
        title.textContent = '批次跳轉 (請點擊下方框按 Ctrl+V)';
        title.style.fontSize = '13px';
        title.style.fontWeight = 'bold';

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        Object.assign(closeBtn.style, {
            background: 'none',
            border: 'none',
            color: '#aaa',
            cursor: 'pointer',
            fontSize: '14px'
        });
        closeBtn.onclick = () => {
            panel.style.display = 'none';
            toggleBtn.style.display = 'block';
        };

        header.appendChild(title);
        header.appendChild(closeBtn);

        // 多行輸入框
        const textarea = document.createElement('textarea');
        textarea.placeholder = '請直接點擊此處並按 Ctrl+V 貼上\n\n支援連在一起的網址：\nhttps://www.threads.com/@user1https://www.threads.com/@user2';
        Object.assign(textarea.style, {
            width: '100%',
            height: '180px',
            backgroundColor: '#262626',
            color: '#fff',
            border: '1px solid #444',
            borderRadius: '6px',
            padding: '8px',
            boxSizing: 'border-box',
            fontSize: '12px',
            resize: 'vertical'
        });

        // 執行按鈕
        const runBtn = document.createElement('button');
        runBtn.textContent = '開始依序跳轉';
        Object.assign(runBtn.style, {
            width: '100%',
            padding: '9px',
            backgroundColor: '#fff',
            color: '#000',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '12px'
        });

        // 中止按鈕
        const stopBtn = document.createElement('button');
        stopBtn.textContent = '停止任務';
        Object.assign(stopBtn.style, {
            width: '100%',
            padding: '6px',
            backgroundColor: '#ff4d4f',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'none'
        });

        const updateBtnState = () => {
            const running = GM_getValue(STORAGE_KEY_RUNNING, false);
            stopBtn.style.display = running ? 'block' : 'none';
            runBtn.textContent = running ? '重設並重新開始' : '開始依序跳轉';
        };

        runBtn.onclick = () => {
            const urls = parseToThreadsUrls(textarea.value);

            if (urls.length === 0) {
                alert('未辨識出任何有效帳號或網址！');
                return;
            }

            const firstUrl = urls.shift();
            GM_setValue(STORAGE_KEY_QUEUE, urls);
            GM_setValue(STORAGE_KEY_RUNNING, true);

            log(`辨識完成，共 ${urls.length + 1} 筆，前往首個目標: ${firstUrl}`);
            window.location.replace(firstUrl);
        };

        stopBtn.onclick = () => {
            GM_setValue(STORAGE_KEY_RUNNING, false);
            GM_setValue(STORAGE_KEY_QUEUE, []);
            updateBtnState();
            log('已手動停止任務');
        };

        panel.appendChild(header);
        panel.appendChild(textarea);
        panel.appendChild(runBtn);
        panel.appendChild(stopBtn);

        toggleBtn.onclick = () => {
            updateBtnState();
            toggleBtn.style.display = 'none';
            panel.style.display = 'flex';
        };

        document.body.appendChild(toggleBtn);
        document.body.appendChild(panel);
    }

    function init() {
        createUI();
        checkQueueStatus();
    }

    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
