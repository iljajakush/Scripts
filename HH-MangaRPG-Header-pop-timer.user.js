// ==UserScript==
// @name         Hentai Heroes & MangaRPG - Manga Style Header (v29.0)
// @namespace    http://tampermonkey.net/
// @version      29.0
// @description  Compact header, cloned energy bars in a grid, for HH and MangaRPG.
// @author       You
// @match        https://*.hentaiheroes.com/*
// @match        https://nutaku.haremheroes.com/*
// @match        https://*.mangarpg.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const style = document.createElement('style');
    style.innerHTML = `
        /* --- GLOBAL COMPACTNESS --- */
        #contains_all > header { zoom: 0.85; transition: opacity 0.2s ease; }
        #contains_all > header.hidden-header { opacity: 0; pointer-events: none; }
        
        #toggle-header-btn {
            position: fixed; top: 15px; left: 5px; z-index: 9999;
            background: linear-gradient(180deg, #6b0f2b, #3b0016);
            border: 1px solid #ff4d6d; border-radius: 4px; color: #fff;
            padding: 1px 4px; cursor: pointer; font-family: Tahoma, sans-serif;
            font-weight: bold; font-size: 9px; box-shadow: 0 2px 4px rgba(0,0,0,0.5);
        }

        #contains_all > header div[rel="xp"] { display: none !important; }
        header .energy_counter_container { display: none !important; }
        
        header .promo_fight_discount_text, header .promo_fight_discount, header .booster_promo, header .promo_quest_discount, header .promo_profile_discount, header .boosters_bought { display: none !important; }

        .custom-avatar-xp-wrapper {
            display: flex; align-items: center; background: rgba(0,0,0,0.3);
            border-radius: 6px; padding-right: 5px; margin-right: 10px;
        }
        
        #custom-xp-container {
            display: flex; align-items: center; height: 34px; color: #fff;
            font-family: Tahoma, sans-serif; font-weight: bold; text-shadow: 1px 1px 0 #000;
            cursor: pointer; margin-left: 5px;
        }

        .custom-xp-bar { width: 30px; height: 8px; background: #200307; border-radius: 4px; margin: 0 4px; overflow: hidden; border: 1px solid #000; }
        .custom-xp-fill { height: 100%; background: linear-gradient(90deg, #ff007f, #ff4d6d); }

        /* --- НАША СЕТКА --- */
        #custom-energy-grid {
            display: grid !important;
            grid-template-columns: auto auto !important;
            grid-auto-rows: auto !important;
            gap: 2px 8px !important;
            align-items: center !important;
            margin-left: 5px;
            align-content: center !important;
        }

        #custom-energy-grid .energy_counter {
            margin: 0 !important; padding: 0 !important; width: auto !important;
            display: flex !important; align-items: center !important; position: relative !important;
        }

        #custom-energy-grid .energy_counter .bar-wrapper {
            width: 80px !important; transform: scale(0.9); transform-origin: left center; margin: 0 !important;
        }

        #custom-energy-grid .energy_counter plus {
            transform: scale(0.85); margin-left: -5px !important; margin-top: 0 !important; margin-bottom: 0 !important; z-index: 1;
        }

        /* --- FLOATING TIMER --- */
        #custom-compact-pop-timer {
            position: fixed; top: 75px; right: 220px;
            background: linear-gradient(90deg, #3b0016 0%, #70052a 100%);
            border: 1px solid #ff4d6d; border-radius: 12px; padding: 4px 12px;
            color: #fff; font-family: Tahoma, sans-serif; font-size: 12px; font-weight: bold;
            text-shadow: 1px 1px 0 #000; white-space: nowrap; cursor: pointer;
            box-shadow: 0 4px 6px rgba(0,0,0,0.6); z-index: 9998;
        }
        #custom-compact-pop-timer:hover { filter: brightness(1.2); }
    `;
    document.head.appendChild(style);

    function formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    }

    function setupHeaderChanges() {
        const header = document.querySelector('#contains_all > header');
        const avatar = document.querySelector('header div[rel="avatar"]');
        if (!header) return;

        if (!document.getElementById('toggle-header-btn')) {
            const toggleBtn = document.createElement('div');
            toggleBtn.id = 'toggle-header-btn';
            toggleBtn.innerHTML = '▼';
            document.body.appendChild(toggleBtn);
            toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isHidden = header.classList.toggle('hidden-header');
                const timer = document.getElementById('custom-compact-pop-timer');
                if (timer) timer.style.display = isHidden ? 'none' : 'flex';
                header.style.display = isHidden ? 'none' : 'flex';
                toggleBtn.innerHTML = isHidden ? '▲' : '▼';
            });
        }

        if (avatar && !document.querySelector('.custom-avatar-xp-wrapper')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'custom-avatar-xp-wrapper';
            avatar.parentNode.insertBefore(wrapper, avatar);
            wrapper.appendChild(avatar);

            const xpContainer = document.createElement('div');
            xpContainer.id = 'custom-xp-container';
            
            const hero = window.Hero || (window.shared && window.shared.Hero);
            let level = '?'; let xpText = ''; let percentage = 0;
            if (hero && hero.infos && hero.infos.Xp) {
                level = hero.infos.level;
                const xp = hero.infos.Xp;
                xpText = formatNumber(xp.cur) + '/' + formatNumber(xp.max);
                if (xp.max > 0) percentage = (xp.cur / xp.max) * 100;
            }
            xpContainer.innerHTML = `
                <div style="display:flex; flex-direction:column; align-items:center; margin-right: 3px;">
                    <span style="color:#ffcc00; font-size:9px;">Lvl</span>
                    <span style="font-size:13px;">${level}</span>
                </div>
                <div class="custom-xp-bar"><div class="custom-xp-fill" style="width: ${percentage}%"></div></div>
                <div style="display:flex; flex-direction:column; text-align:left;">
                    <span style="font-size:8px; color:#ccc;">Next</span>
                    <span style="font-size:9px;">${xpText}</span>
                </div>
            `;
            xpContainer.addEventListener('click', (e) => {
                e.preventDefault(); e.stopPropagation(); 
                const originalLevelBtn = document.querySelector('header div[rel="xp"] .bar-wrapper, header [hero="level"]');
                if (originalLevelBtn) originalLevelBtn.click();
            });
            wrapper.appendChild(xpContainer);
        }
    }

    function buildGridLoop() {
        if (document.getElementById('custom-energy-grid')) return;
        const originalContainer = document.querySelector('header .energy_counter_container');
        if (!originalContainer) return;
        const allBars = Array.from(document.querySelectorAll('header .energy_counter:not([type="quest"])'));
        if (allBars.length >= 4) {
            const grid = document.createElement('div');
            grid.id = 'custom-energy-grid';
            allBars.forEach(original => {
                const clone = original.cloneNode(true);
                clone.removeAttribute('style');
                clone.classList.remove('position-quest', 'position-pvp-arena');
                const plusBtn = clone.querySelector('plus');
                if (plusBtn) {
                    plusBtn.addEventListener('click', () => {
                        const type = original.getAttribute('type');
                        const origPlus = document.querySelector(`header .energy_counter[type="${type}"] plus`);
                        if (origPlus) origPlus.click();
                    });
                }
                grid.appendChild(clone);
            });
            const avatarWrapper = document.querySelector('.custom-avatar-xp-wrapper');
            if (avatarWrapper) {
                avatarWrapper.parentNode.insertBefore(grid, avatarWrapper.nextSibling);
            }
        }
    }

    function updateCloneValues() {
        const grid = document.getElementById('custom-energy-grid');
        if (!grid) return;
        const allBars = Array.from(document.querySelectorAll('header .energy_counter:not([type="quest"])'));
        allBars.forEach((original, index) => {
            const clone = grid.children[index];
            if (clone) {
                const origOver = original.querySelector('.bar-wrapper .over');
                const cloneOver = clone.querySelector('.bar-wrapper .over');
                if (origOver && cloneOver) cloneOver.innerHTML = origOver.innerHTML;
                const origBar = original.querySelector('.bar-wrapper .bar');
                const cloneBar = clone.querySelector('.bar-wrapper .bar');
                if (origBar && cloneBar) cloneBar.style.width = origBar.style.width;
            }
        });
    }

    // --- ТАЙМЕР ---
    function formatTime(seconds) { if (seconds <= 0) return "Ready"; const h = Math.floor(seconds / 3600); const m = Math.floor((seconds % 3600) / 60); const s = seconds % 60; return `${h > 0 ? h + 'h ' : ''}${m > 0 ? m + 'm ' : ''}${s}s`; }
    function getMinPoPTime() { let minTimeLeft = Infinity; let exactEndTime = null; if (typeof window.pop_data !== 'undefined' && window.server_now_ts) { Object.values(window.pop_data).forEach(pop => { if (pop.remaining_time && pop.remaining_time > 0 && pop.remaining_time < minTimeLeft) { minTimeLeft = pop.remaining_time; exactEndTime = window.server_now_ts + pop.remaining_time; } }); } if (minTimeLeft === Infinity) { try { const trackedTimesStr = localStorage.getItem('HHPlusPlusTrackedTimes'); if (trackedTimesStr) { const trackedTimes = JSON.parse(trackedTimesStr); if (trackedTimes && trackedTimes.pop && window.server_now_ts) { const timeLeft = trackedTimes.pop - window.server_now_ts; if (timeLeft > 0) { minTimeLeft = timeLeft; exactEndTime = trackedTimes.pop; } else { minTimeLeft = 0; exactEndTime = trackedTimes.pop; } } } } catch (e) {} } return { timeLeft: minTimeLeft, endTime: exactEndTime }; }
    function insertPoPTimer() { if (document.getElementById('custom-compact-pop-timer')) return; const timerContainer = document.createElement('div'); timerContainer.id = 'custom-compact-pop-timer'; timerContainer.innerHTML = `<span style="color: #ffcc00;">Places of Power:</span> <span id="custom-pop-time-text">...</span>`; timerContainer.addEventListener('mouseenter', () => { const { endTime } = getMinPoPTime(); if (endTime) { const date = new Date(endTime * 1000); const dateString = date.toLocaleString('en-GB', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }); const tooltip = document.createElement('div'); tooltip.id = 'pop-timer-tooltip'; tooltip.style.cssText = `position: absolute; top: 100%; left: 50%; transform: translateX(-50%); margin-top: 5px; background: rgba(20,5,10,0.95); border: 1px solid #ff4d6d; border-radius: 5px; padding: 4px 8px; color: #fff; font-size: 11px; z-index: 10000; white-space: nowrap; pointer-events: none;`; tooltip.innerHTML = `Ends: <span style="color:#ffcc00;">${dateString}</span>`; timerContainer.appendChild(tooltip); } }); timerContainer.addEventListener('mouseleave', () => { const tip = document.getElementById('pop-timer-tooltip'); if (tip) tip.remove(); }); timerContainer.onclick = () => window.location.href = '/activities.html?tab=pop'; document.body.appendChild(timerContainer); updateTimerLoop(); }
    function updateTimerLoop() { updateCloneValues(); const timeText = document.getElementById('custom-pop-time-text'); if (timeText) { const { timeLeft } = getMinPoPTime(); if (timeLeft !== Infinity) { if (timeLeft === 0) { timeText.textContent = "Ready"; timeText.style.color = '#75b400'; } else { timeText.textContent = formatTime(timeLeft); timeText.style.color = timeLeft < 600 ? '#ff4d4d' : '#fff'; } } else { timeText.textContent = "Waiting..."; timeText.style.color = '#aaa'; } } setTimeout(updateTimerLoop, 1000); }

    window.addEventListener('load', () => {
        setupHeaderChanges();
        insertPoPTimer();
        const gridCheckInterval = setInterval(() => {
            if (document.getElementById('custom-energy-grid')) {
                clearInterval(gridCheckInterval);
            } else {
                buildGridLoop();
            }
        }, 1000);
    });
})();