// ==UserScript==
// @name         Hentai Heroes & MangaRPG - Manga Style Header (v30.0 No Timer)
// @namespace    http://tampermonkey.net/
// @version      30.0
// @description  Compact header, cloned energy bars in a grid. No duplicate timer.
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

    window.addEventListener('load', () => {
        setupHeaderChanges();
        
        const gridCheckInterval = setInterval(() => {
            if (document.getElementById('custom-energy-grid')) {
                clearInterval(gridCheckInterval);
            } else {
                buildGridLoop();
            }
        }, 1000);

        setInterval(updateCloneValues, 1000);
    });
})();