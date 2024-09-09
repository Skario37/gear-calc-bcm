window.addEventListener("DOMContentLoaded", async () => {
    this.data = await getData("stat.json");

    this.setGearElements();
    this.gridGearCells = document.querySelectorAll(".grid-gear div");
    this.gridGearState = Array(6).fill().map(() => Array(6).fill(false));

    this.accElements = this.setAccElements();
    this.gridAccCells = document.querySelectorAll(".grid-accessory div");
    this.gridAccState = Array(3).fill(false);

    this.talentElements = this.setTalentElements();
    this.gridTalentCells = document.querySelectorAll(".grid-talent div");
    this.gridTalentState = Array(3).fill(false);

    this.charDupes = {
        value: 0,
        max: 5,
        min: 0,
        step: 1,
        disabled: true
    } 

    this.charLevels = {
        value: 100,
        min: 100,
        max: 125,
        step: 1,
        disabled: true
    }

    this.equipped = {
        accessories: [],
        gears: [],
        talents: [],
        gearAlwaysUp: 0
    }

    this.setGridGearCellEvents();
    this.setGridAccCellEvents();
    this.setGridTalentCellEvents();
    this.setCharacters();
});

function setTalentElements() {
    const talentAttackContainer = document.getElementById("talent-attack");
    const talentDefenseContainer = document.getElementById("talent-defense");
    const talentSupportContainer = document.getElementById("talent-support");

    this.data.stone_talent.forEach(talent => {
        const div = document.createElement("div");
        div.classList.add("talent-stone");
        const p = document.createElement("p");
        p.innerText = `${talent.name}`;

        const talentElement = document.createElement("div");
        
        talentElement.classList.add(`talent`, `${talent.type}`, `${talent.quality}`);
        talentElement.setAttribute("id", `${talent.name.replace(/\s/g, '')}-${talent.type}-${talent.quality}`);
        talentElement.draggable = true;

        talentElement.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("text/plain", e.target.id);
            this.updateDetails();
        });

        talentElement.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            this.updateDetails();
        });

        talentElement.dataset.type = talent.type;
        talentElement.dataset.quality = talent.quality;
        talentElement.dataset.name = talent.name.replace(/\s/g, '');

        talentElement.classList.add(talentElement.dataset.name.toLocaleLowerCase());

        div.appendChild(p);
        div.appendChild(talentElement);

        if (talent.type === "attack") {
            talentAttackContainer.appendChild(div);
        } else if (talent.type === "defense") {
            talentDefenseContainer.appendChild(div);
        } else if (talent.type === "support") {
            talentSupportContainer.appendChild(div);
        }
    });
}

function setAccElements() {
    const accEarringContainer = document.getElementById("acc-earrings");
    const accNecklaceContainer = document.getElementById("acc-necklaces");
    const accRingContainer = document.getElementById("acc-rings");

    this.data.accessory.forEach(acc => {
        const accElement = document.createElement("div");
        
        accElement.classList.add(`accessory`, `${acc.type}`, `${acc.title}`);
        accElement.setAttribute("id", `${acc.main_stat.type}-${acc.type}-${acc.title}`);

        const accBgIcon = document.createElement("div");
        const accText = document.createElement("span");
        accText.innerText = `${acc.name}`;
        accElement.draggable = true;

        accBgIcon.appendChild(accText);
        accElement.appendChild(accBgIcon);

        accElement.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("text/plain", e.target.id);
            this.updateDetails();
        });

        accElement.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            this.updateDetails();
        });

        accElement.dataset.type = acc.type;
        accElement.dataset.title = acc.title;
        accElement.dataset.mainstat = acc.main_stat.type;

        if (acc.type === "earring") {
            accEarringContainer.appendChild(accElement);
        } else if (acc.type === "necklace") {
            accNecklaceContainer.appendChild(accElement);
        } else if (acc.type === "ring") {
            accRingContainer.appendChild(accElement);
        }
    });
}

function setGearElements() {
    const container = document.getElementById("gear-column");
    this.data.gear.forEach(gear => {
        const gearElement = document.createElement("div");
        gearElement.classList.add(`gear`, `gear-${gear.col}x${gear.row}`, `${gear.title}`);
        gearElement.setAttribute("id", `${gear.main_stat.type}-${gear.col}x${gear.row}`);
        gearElement.draggable = true;

        const gearText = document.createElement("span");
        gearText.innerText = `${gear.name}`;

        gearElement.appendChild(gearText);

        gearElement.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("text/plain", e.target.id);
            this.updateDetails();
        });

        gearElement.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            this.updateDetails();
        });

        gearElement.dataset.type = gear.main_stat.type;
        gearElement.dataset.col = gear.col;
        gearElement.dataset.row = gear.row;
        
        container.appendChild(gearElement);
    });
}

function setGridTalentCellEvents() {
    this.gridTalentCells.forEach(cell => {
        cell.addEventListener("dragover", (e) => {
            e.preventDefault();
            this.updateDetails();
        });

        cell.addEventListener("drop", (e) => {
            e.preventDefault();
            const talentId = e.dataTransfer.getData("text/plain");
            const talentElement = document.getElementById(talentId);
            if (!talentElement.classList.contains("talent")) return;
            
            const targetIndex = Array.from(this.gridTalentCells).indexOf(e.target);

            if (canPlaceTalent(targetIndex, talentElement)) {
                placeTalent(targetIndex, talentElement);

                if (talentElement.dataset.equipped) {
                    removeTalent(talentElement);
                }
            }
            this.updateDetails();
        });
    });
}

function setGridAccCellEvents() {
    this.gridAccCells.forEach(cell => {
        cell.addEventListener("dragover", (e) => {
            e.preventDefault();
            this.updateDetails();
        });

        cell.addEventListener("drop", (e) => {
            e.preventDefault();
            const accId = e.dataTransfer.getData("text/plain");
            const accElement = document.getElementById(accId);
            if (!accElement.classList.contains("accessory")) return;
            
            const targetIndex = Array.from(this.gridAccCells).indexOf(e.target);

            if (canPlaceAcc(targetIndex, accElement)) {
                placeAcc(targetIndex, accElement);

                if (accElement.dataset.equipped) {
                    removeAcc(accElement);
                }
            }
            this.updateDetails();
        });
    });
}

function setGridGearCellEvents() {
    this.gridGearCells.forEach(cell => {
        cell.addEventListener("dragover", (e) => {
            e.preventDefault();
            this.updateDetails();
        });

        cell.addEventListener("drop", (e) => {
            e.preventDefault();
            const gearId = e.dataTransfer.getData("text/plain");
            const gearElement = document.getElementById(gearId);
            if (!gearElement.classList.contains("gear")) return;
            
            const targetIndex = Array.from(this.gridGearCells).indexOf(e.target);
            const targetRow = Math.floor(targetIndex / 6);
            const targetCol = targetIndex % 6;

            
            const gearRow = parseInt(gearElement.dataset.row);
            const gearCol = parseInt(gearElement.dataset.col);
        
            if (canPlaceGear(targetRow, targetCol, gearRow, gearCol)) {
                placeGear(targetRow, targetCol, gearRow, gearCol, gearElement);
                
                if (gearElement.dataset.equipped) {
                    removeGear(gearElement);
                }
            }
            this.updateDetails();
        });
    });
}

function canPlaceTalent(i, talentElement) {
    if (this.gridTalentState[i]) return false;
    if (i === 0) {
        if (talentElement.dataset.type === "attack") return true;
    } else if (i === 1) {
        if (talentElement.dataset.type === "defense") return true;
    } else if (i === 2) {
        if (talentElement.dataset.type === "support") return true;
    }
    return false;
}

function canPlaceAcc(i, accElement) {
    if (this.gridAccState[i]) return false;
    if (i === 0) {
        if (accElement.dataset.type === "earring") return true;
    } else if (i === 1) {
        if (accElement.dataset.type === "necklace") return true;
    } else if (i === 2) {
        if (accElement.dataset.type === "ring") return true;
    }
    return false;
}

function canPlaceGear(row, col, width, height) {
    for (let r = row; r < row + height; r++) {
        for (let c = col; c < col + width; c++) {
            if (r >= 6 || c >= 6 || this.gridGearState[r][c]) {
                return false;
            }
        }
    }
    return true;
}

function placeTalent(i, talentElement) {
    const clonedTalent = talentElement.cloneNode(true);
    clonedTalent.setAttribute("id", `${clonedTalent.id}-${this.equipped.talents.length}`);
    clonedTalent.classList.add("on-grid");

    clonedTalent.dataset.equipped = true;
    clonedTalent.dataset.iState = i;
    this.gridTalentState[i] = true;
 
    this.gridTalentCells[i].appendChild(clonedTalent);

    clonedTalent.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", e.target.id);
        this.updateDetails();
    });
    
    clonedTalent.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        removeTalent(clonedTalent);
        this.updateDetails();
    });

    const objTalent = {
        element: clonedTalent,
        talent: JSON.parse(JSON.stringify(
            this.data.stone_talent.find(e => 
                e.type === clonedTalent.dataset.type
                && e.quality === clonedTalent.dataset.quality
                && e.name.replace(/\s/g, '') === clonedTalent.dataset.name
            )
        )),
        i: this.equipped.talents.length
    }

    this.equipped.talents.push(objTalent);
}

function placeAcc(i, accElement) {
    const clonedAcc = accElement.cloneNode(true);
    clonedAcc.setAttribute("id", `${clonedAcc.id}-${this.equipped.accessories.length}`);
    clonedAcc.classList.add("on-grid");

    clonedAcc.dataset.equipped = true;
    clonedAcc.dataset.iState = i;
    this.gridAccState[i] = true;
 
    this.gridAccCells[i].appendChild(clonedAcc);

    clonedAcc.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", e.target.id);
        this.updateDetails();
    });
    
    clonedAcc.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        removeAcc(clonedAcc);
        this.updateDetails();
    });

    const objAcc = {
        element: clonedAcc,
        acc: JSON.parse(JSON.stringify(
            this.data.accessory.find(e => 
                e.main_stat.type === clonedAcc.dataset.mainstat
                && e.type === clonedAcc.dataset.type
                && e.title === clonedAcc.dataset.title
            )
        )),
        i: this.equipped.accessories.length
    }

    this.equipped.accessories.push(objAcc);
    this.addAccStats(objAcc);
}

function placeGear(row, col, width, height, gearElement) {
    const clonedGear = gearElement.cloneNode(true);
    clonedGear.setAttribute("id", `${clonedGear.dataset.type}-${clonedGear.dataset.col}x${clonedGear.dataset.row}-${this.equipped.gearAlwaysUp}`);
    clonedGear.classList.add("on-grid");

    clonedGear.dataset.rowStart = row;
    clonedGear.dataset.colStart = col;
    clonedGear.dataset.rowEnd = row + height;
    clonedGear.dataset.colEnd = col + width;

    clonedGear.dataset.equipped = true;

    for (let r = row; r < row + height; r++) {
        for (let c = col; c < col + width; c++) {
            this.gridGearState[r][c] = true;
        }
    }

    const targetIndex = row * 6 + col;
    this.gridGearCells[targetIndex].appendChild(clonedGear);

    clonedGear.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", e.target.id);
        this.updateDetails();
    });
    
    clonedGear.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        removeGear(clonedGear);
        this.updateDetails();
    });

    const objGear = {
        element: clonedGear,
        gear: JSON.parse(JSON.stringify(
            this.data.gear.find(e => 
                e.main_stat.type === clonedGear.dataset.type 
                && e.col == clonedGear.dataset.col
                && e.row == clonedGear.dataset.row
            )
        )),
        i: this.equipped.gearAlwaysUp
    }

    this.equipped.gears.push(objGear);
    this.equipped.gearAlwaysUp++;
    this.addGearStats(objGear);
}

function removeTalent(talent) {
    const parentCell = talent.parentElement;

    if (parentCell) {
        parentCell.removeChild(talent);

        const iState = parseInt(talent.dataset.iState, 10);

        this.gridTalentState[iState] = false;

        const iTalent = this.equipped.talents.findIndex(e => e.element.id === talent.id);
        this.equipped.talents.splice(iTalent, 1);
    }
}

function removeAcc(acc) {
    const parentCell = acc.parentElement;

    if (parentCell) {
        parentCell.removeChild(acc);

        const iState = parseInt(acc.dataset.iState, 10);

        this.gridAccState[iState] = false;

        const iAcc = this.equipped.accessories.findIndex(e => e.element.id === acc.id);
        this.removeAccStats(this.equipped.accessories[iAcc].i);
        this.equipped.accessories.splice(iAcc, 1);
    }
}

function removeGear(gear) {
    const parentCell = gear.parentElement;
    
    if (parentCell) {
        parentCell.removeChild(gear);
        
        const rowStart = parseInt(gear.dataset.rowStart, 10);
        const colStart = parseInt(gear.dataset.colStart, 10);
        const rowEnd = parseInt(gear.dataset.rowEnd, 10);
        const colEnd = parseInt(gear.dataset.colEnd, 10);

        for (let r = rowStart; r < rowEnd; r++) {
            for (let c = colStart; c < colEnd; c++) {
                this.gridGearState[r][c] = false;
            }
        }
        
        const iGear = this.equipped.gears.findIndex(e => e.element.id === gear.id);
        this.removeGearStats(this.equipped.gears[iGear].i);
        this.equipped.gears.splice(iGear, 1);
    }
}

function removeAccStats(i) {
    const elem = document.getElementById(`stats-acc-${i}`);
    elem.remove();
}

function removeGearStats(i) {
    const elem = document.getElementById(`stats-gear-${i}`);
    elem.remove();
}

function addAccStats(obj) {
    const container = document.getElementById("acc-stats");

    const div = document.createElement("div");
    div.setAttribute("id", `stats-acc-${obj.i}`);
    div.classList.add(`param-${obj.element.dataset.type}`);

    const mainLevelContainer = document.createElement("div");
    mainLevelContainer.classList.add("main-level-container");

    const icon = document.createElement("img");
    if (obj.element.dataset.type === "earring") {
        icon.src = "./img/external/accessory/bg_earring.png";
    } else if (obj.element.dataset.type === "necklace") {
        icon.src = "./img/external/accessory/bg_necklace.png";
    } else if (obj.element.dataset.type === "ring") {
        icon.src = "./img/external/accessory/bg_ring.png";
    }

    const levelName = `stats-acc-${obj.i}-level`;
    const labelLevel = document.createElement("label");
    labelLevel.setAttribute("for", levelName);
    labelLevel.innerText = "Level:";
    const inputLevel = document.createElement("input");
    inputLevel.classList.add("input-level");
    inputLevel.name = levelName;
    inputLevel.type = "number";
    inputLevel.min = obj.acc.min_lvl;
    inputLevel.max = obj.acc.max_lvl;
    inputLevel.step = 1;
    inputLevel.value = obj.acc.min_lvl;
    const levelContainer = document.createElement("div");
    levelContainer.appendChild(labelLevel);
    levelContainer.appendChild(inputLevel);

    const mainStat = document.createElement("p");
    mainStat.innerText = `${obj.acc.name} ${obj.acc.main_stat.min_value}`;

    levelContainer.appendChild(mainStat);
    mainLevelContainer.appendChild(levelContainer);
    mainLevelContainer.appendChild(icon);

    const slotsContainer = document.createElement("div");
    const slotTitleContainer = document.createElement("div");
    slotTitleContainer.classList.add("grid-slot");
    const slotTitleName = document.createElement("h4");
    slotTitleName.innerText = "Name:";
    const slotTitleStat = document.createElement("h4");
    slotTitleStat.innerText = "Stat:";
    const slotTitleEnch = document.createElement("h4");
    slotTitleEnch.innerText = "Enchantment:";
    slotTitleContainer.appendChild(slotTitleName);
    slotTitleContainer.appendChild(slotTitleStat);
    slotTitleContainer.appendChild(slotTitleEnch);
    slotsContainer.appendChild(slotTitleContainer);
    for (let i = 0; i < obj.acc.max_slots; i++) {
        const slotContainer = document.createElement("div");
        slotContainer.classList.add("grid-slot");
        const slotSelect = document.createElement("select");
        slotSelect.classList.add("slot-select")
        if (i != 0) slotSelect.setAttribute("disabled",true);
        slotSelect.dataset.i = i;

        const emptyOption = document.createElement("option");
        emptyOption.value = "empty";
        emptyOption.innerText = "...";
        slotSelect.appendChild(emptyOption);

        const slotInput = document.createElement("input");
        slotInput.classList.add("input-slot");
        slotInput.type = "number";
        slotInput.setAttribute("disabled", true);

        const enchSlotInput = document.createElement("input");
        enchSlotInput.classList.add("input-ench");
        enchSlotInput.type = "number";
        enchSlotInput.setAttribute("disabled", true);

        obj.acc.slot_stats.forEach(stat => {
            const slotOption = document.createElement("option");
            slotOption.value = stat.type;
            slotOption.innerText = stat.name;

            slotSelect.appendChild(slotOption);
        });

        const slotRank = document.createElement("img");
        const enchSlotRank = document.createElement("img");
        const divSlot = document.createElement("div");
        const divEnchSlot = document.createElement("div");

        divSlot.appendChild(slotRank);
        divSlot.appendChild(slotInput);
        divEnchSlot.appendChild(enchSlotRank);
        divEnchSlot.appendChild(enchSlotInput);

        slotContainer.appendChild(slotSelect);
        slotContainer.appendChild(divSlot);
        slotContainer.appendChild(divEnchSlot);
        slotsContainer.appendChild(slotContainer);

        slotSelect.addEventListener("change", e => {
            const selects = slotsContainer.querySelectorAll("select");

            const indexes = [];
            
            for (let j = 0; j < selects.length; j++) {
                indexes.push(selects[j].selectedIndex);
            }
            
            for (let j = 0; j < selects.length; j++) {
                const options = selects[j].querySelectorAll("option");
                for (let k = 1; k < options.length; k++) {
                    if (indexes.includes(k)) {
                        options[k].setAttribute("disabled", true)
                    } else {
                        options[k].removeAttribute("disabled");
                    }
                }
            }

            const slotStats = obj.acc.slot_stats.find(s => s.type === e.target.value);
            const enchStats = this.data.enchantments.accessory[e.target.value];

            if (e.target.value !== "empty") {
                slotInput.min = slotStats.min_value;
                slotInput.max = slotStats.max_value;
                slotInput.step = slotStats.step;
                slotInput.value = slotStats.min_value;
                
                enchSlotInput.min = enchStats.min_value;
                enchSlotInput.max = enchStats.max_value;
                enchSlotInput.step = enchStats.step;
                enchSlotInput.value = 0;

                slotInput.removeEventListener("change", this._handleSlotInputChange);
                enchSlotInput.removeEventListener("change", this._handleEnchSlotInputChange);

                this._handleSlotInputChange = (si) => handleSlotInputChange.call(this, si, slotStats, slotRank);
                this._handleEnchSlotInputChange = (si) => handleEnchSlotInputChange.call(this, si, enchStats, enchSlotRank);

                slotInput.addEventListener("change", this._handleSlotInputChange);
                enchSlotInput.addEventListener("change", this._handleEnchSlotInputChange);

                slotInput.removeAttribute("disabled");
                enchSlotInput.removeAttribute("disabled");
            } else {
                slotInput.setAttribute("disabled", true);
                slotInput.value = "";
                divSlot.appendChild(slotInput);

                enchSlotInput.setAttribute("disabled", true);
                enchSlotInput.value = "";
                divEnchSlot.appendChild(enchSlotInput);
            }

            this.updateRank(parseFloat(slotInput.value), slotStats, slotRank);
            this.updateRank(parseFloat(enchSlotInput.value), enchStats, enchSlotRank);
            this.updateDetails();
        });
    }

    inputLevel.addEventListener("change", e => {
        const value = parseInt(e.target.value);
        if (value > obj.acc.max_lvl) e.target.value = obj.acc.max_lvl;
        if (value < obj.acc.min_lvl) e.target.value = obj.acc.min_lvl;

        const sl = Math.floor(value / obj.acc.slot_incr);
        
        for (let i = sl + 1; i < 4; i++) {
            const select = slotsContainer.querySelector(`select[data-i='${i}']`);
            select.options[0].selected = true;
            
            select.setAttribute("disabled",true);
            const slotInput = select.nextElementSibling;
            slotInput.setAttribute("disabled",true);
            slotInput.value = "";

            const enchSlotInput = slotInput.nextElementSibling;
            enchSlotInput.setAttribute("disabled", true);
            enchSlotInput.value = "";
        }

        for (let i = 0; i <= sl; i++) {
            const select = slotsContainer.querySelector(`select[data-i='${i}']`);
            select.removeAttribute("disabled");
        }


        mainStat.innerText = `${obj.acc.name} ${this.toFixed(obj.acc.main_stat.min_value + (obj.acc.main_stat.step * inputLevel.value), 2)}`;
        this.updateDetails();
    });

    div.appendChild(mainLevelContainer);
    div.appendChild(slotsContainer);

    container.appendChild(div);
}

function addGearStats(obj) {
    const container = document.getElementById("gear-stats");

    const div = document.createElement("div");
    div.setAttribute("id", `stats-gear-${obj.i}`);

    const bgDiv = document.createElement("div");
    bgDiv.classList.add("bg-gear", `bg-gear-${obj.gear.title}`, `bg-gear-${obj.gear.col}x${obj.gear.row}`);
    
    const mainLevelContainer = document.createElement("div");
    mainLevelContainer.classList.add("main-level-container");

    const levelContainer = document.createElement("div");
    const levelName = `stats-gear-${obj.i}-level`;
    const labelLevel = document.createElement("label");
    labelLevel.setAttribute("for", levelName);
    labelLevel.innerText = "Level:";
    const inputLevel = document.createElement("input");
    inputLevel.classList.add("input-level");
    inputLevel.name = levelName;
    inputLevel.type = "number";
    inputLevel.min = obj.gear.min_lvl;
    inputLevel.max = obj.gear.max_lvl;
    inputLevel.step = 1;
    inputLevel.value = obj.gear.min_lvl;
    levelContainer.appendChild(labelLevel);
    levelContainer.appendChild(inputLevel);
    
    const mainStat = document.createElement("p");
    mainStat.innerText = `${obj.gear.name} ${obj.gear.main_stat.min_value}`;

    const transContainer = document.createElement("div");
    transContainer.classList.add("trans-container", "disabled");
    
    const transImgContainer = document.createElement("div");
    transImgContainer.classList.add("trans-base");
    
    const transLessDiv = document.createElement("div");
    const transLess = document.createElement("img");
    transLess.classList.add("arrow-img", "flip");
    transLess.src = "./img/external/common/icon_arrow.png";
    transLessDiv.appendChild(transLess);

    const transMoreDiv = document.createElement("div");
    const transMore = document.createElement("img");
    transMore.classList.add("arrow-img");
    transMore.src = "./img/external/common/icon_arrow.png";
    transMoreDiv.appendChild(transMore);

    transContainer.appendChild(transLessDiv);
    transContainer.appendChild(transImgContainer);
    transContainer.appendChild(transMoreDiv);

    obj.trans = {
        value: 0,
        max: obj.gear.max_trans,
        min: obj.gear.min_trans,
        step: 1,
        disabled: true
    }

    for (let i = 1; i <= obj.trans.max; i++) {
        const transImg = document.createElement("div");
        transImg.id = `trans-${obj.i}-img-${i}`;
        transImg.classList.add(`trans-img-${i}`);
        transImgContainer.appendChild(transImg);
    }
    
    if (obj.trans.disabled) container.classList.add("disabled");

    mainLevelContainer.appendChild(levelContainer);
    mainLevelContainer.appendChild(transContainer);

    const slotsContainer = document.createElement("div");
    const slotTitleContainer = document.createElement("div");
    slotTitleContainer.classList.add("grid-slot");
    const slotTitleName = document.createElement("h4");
    slotTitleName.innerText = "Name:";
    const slotTitleStat = document.createElement("h4");
    slotTitleStat.innerText = "Stat:";
    const slotTitleEnch = document.createElement("h4");
    slotTitleEnch.innerText = "Enchantment:";
    slotTitleContainer.appendChild(slotTitleName);
    slotTitleContainer.appendChild(slotTitleStat);
    slotTitleContainer.appendChild(slotTitleEnch);
    slotsContainer.appendChild(slotTitleContainer);

    for (let i = 0; i < obj.gear.max_slots; i++) {
        const slotContainer = document.createElement("div");
        slotContainer.classList.add("grid-slot");

        const slotSelect = document.createElement("select");
        slotSelect.classList.add("slot-select");
        if (i != 0) slotSelect.setAttribute("disabled",true);
        slotSelect.dataset.i = i;
        slotSelect.dataset.slot = "normal";

        const emptyOption = document.createElement("option");
        emptyOption.value = "empty";
        emptyOption.innerText = "...";
        slotSelect.appendChild(emptyOption);

        const slotInput = document.createElement("input");
        slotInput.classList.add("input-slot");
        slotInput.type = "number";
        slotInput.setAttribute("disabled", true);
        
        const enchSlotInput = document.createElement("input");
        enchSlotInput.classList.add("input-ench");
        enchSlotInput.type = "number";
        enchSlotInput.setAttribute("disabled", true);

        obj.gear.slot_stats.forEach(stat => {
            const slotOption = document.createElement("option");
            slotOption.value = stat.type;
            slotOption.innerText = stat.name;

            slotSelect.appendChild(slotOption);
        });

        slotContainer.appendChild(slotSelect);
        slotContainer.appendChild(slotInput);
        slotContainer.appendChild(enchSlotInput);
        slotsContainer.appendChild(slotContainer);

        slotSelect.addEventListener("change", e => {
            const selects = slotsContainer.querySelectorAll("select[data-slot='normal']");

            const indexes = [];
            
            for (let j = 0; j < selects.length; j++) {
                indexes.push(selects[j].selectedIndex);
            }
            
            for (let j = 0; j < selects.length; j++) {
                const options = selects[j].querySelectorAll("option");
                for (let k = 1; k < options.length; k++) {
                    if (indexes.includes(k)) {
                        options[k].setAttribute("disabled", true)
                    } else {
                        options[k].removeAttribute("disabled");
                    }
                }
            }

            if (e.target.value !== "empty") {
                const slotStats = obj.gear.slot_stats.find(s => s.type === e.target.value);
                const enchStats = this.data.enchantments.gear[e.target.value];

                slotInput.min = slotStats.min_value;
                slotInput.max = slotStats.max_value;
                slotInput.step = slotStats.step;
                slotInput.value = slotStats.min_value;

                enchSlotInput.min = enchStats.min_value;
                enchSlotInput.max = enchStats.max_value;
                enchSlotInput.step = enchStats.step;
                enchSlotInput.value = 0;

                slotInput.removeEventListener("change", this._handleSlotInputChange);
                enchSlotInput.removeEventListener("change", this._handleEnchSlotInputChange);

                this._handleSlotInputChange = (si) => handleSlotInputChange.call(this, si, slotStats);
                this._handleEnchSlotInputChange = (si) => handleEnchSlotInputChange.call(this, si, enchStats);

                slotInput.addEventListener("change", this._handleSlotInputChange);
                enchSlotInput.addEventListener("change", this._handleEnchSlotInputChange);

                slotInput.removeAttribute("disabled");
                enchSlotInput.removeAttribute("disabled");
            } else {
                slotInput.setAttribute("disabled", true);
                slotInput.value = "";
                slotContainer.appendChild(slotInput);

                enchSlotInput.setAttribute("disabled", true);
                enchSlotInput.value = "";
                slotContainer.appendChild(enchSlotInput);
            }
            this.updateDetails();
        });
    }
    
    const slotTransContainer = document.createElement("div");
    slotTransContainer.classList.add("grid-slot");
    const slotTransSelect = document.createElement("select");
    slotTransSelect.classList.add("slot-select")
    slotTransSelect.setAttribute("disabled",true);
    slotTransSelect.dataset.slot = "trans";
    const emptyOption = document.createElement("option");
    emptyOption.value = "empty";
    emptyOption.innerText = "...";
    slotTransSelect.appendChild(emptyOption);

    const slotTransInput = document.createElement("input");
    slotTransInput.classList.add("input-slot");
    slotTransInput.type = "number";
    slotTransInput.setAttribute("disabled", true);

    const enchSlotTransInput = document.createElement("input");
    enchSlotTransInput.classList.add("input-ench");
    enchSlotTransInput.type = "number";
    enchSlotTransInput.setAttribute("disabled", true);

    obj.gear.slot_stats.forEach(stat => {
        const slotOption = document.createElement("option");
        slotOption.value = stat.type;
        slotOption.innerText = stat.name;

        slotTransSelect.appendChild(slotOption);
    });

    slotTransContainer.appendChild(slotTransSelect);
    slotTransContainer.appendChild(slotTransInput);
    slotTransContainer.appendChild(enchSlotTransInput);
    slotsContainer.appendChild(slotTransContainer);

    slotTransSelect.addEventListener("change", e => {
        const slotStats = obj.gear.slot_stats.find(s => s.type === e.target.value);
        const enchStats = this.data.enchantments.gear[e.target.value];

        if (e.target.value !== "empty") {
            slotTransInput.min = slotStats.min_value;
            slotTransInput.max = slotStats.max_value;
            slotTransInput.step = slotStats.step;
            slotTransInput.value = slotStats.min_value;

            enchSlotTransInput.min = enchStats.min_value;
            enchSlotTransInput.max = enchStats.max_value;
            enchSlotTransInput.step = enchStats.step;
            enchSlotTransInput.value = 0;

            slotTransInput.removeEventListener("change", this._handleSlotInputChange);
            enchSlotTransInput.removeEventListener("change", this._handleEnchSlotInputChange);

            this._handleSlotInputChange = (si) => handleSlotInputChange.call(this, si, slotStats);
            this._handleEnchSlotInputChange = (si) => handleEnchSlotInputChange.call(this, si, enchStats);

            slotTransInput.addEventListener("change", this._handleSlotInputChange);
            enchSlotTransInput.addEventListener("change", this._handleEnchSlotInputChange);

            slotTransInput.removeAttribute("disabled");
            enchSlotTransInput.removeAttribute("disabled");
        } else {
            slotTransInput.setAttribute("disabled", true);
            slotTransInput.value = "";
            slotTransContainer.appendChild(slotTransInput);

            enchSlotTransInput.setAttribute("disabled", true);
            enchSlotTransInput.value = "";
            slotTransContainer.appendChild(enchSlotTransInput);
        }
        this.updateDetails();
    });


    inputLevel.addEventListener("change", e => {
        const value = parseInt(e.target.value);
        if (value > obj.gear.max_lvl) e.target.value = obj.gear.max_lvl;
        if (value < obj.gear.min_lvl) e.target.value = obj.gear.min_lvl;

        if (value === 12) {
            obj.trans.disabled = false;
            transContainer.classList.remove("disabled");
        }
        else {
            obj.trans.value = 0;
            obj.trans.disabled = true;
            transContainer.classList.add("disabled");
            for (let i = 1; i <= obj.trans.max; i++) {
                const transImg = document.getElementById(`trans-img-${i}`);
                transImg?.classList.remove("on-trans");
            }

            slotTransSelect.options[0].selected = true;
            slotTransSelect.setAttribute("disabled", true);

            slotTransInput.setAttribute("disabled", true);
            slotTransInput.value = "";

            enchSlotTransInput.setAttribute("disabled", true);
            enchSlotTransInput.value = "";
        }

        const sl = Math.floor(value / obj.gear.slot_incr);
        
        for (let i = sl + 1; i < 4; i++) {
            const select = slotsContainer.querySelector(`select[data-i='${i}']`);
            select.options[0].selected = true;
            
            select.setAttribute("disabled", true);
            const slotInput = select.nextElementSibling;
            slotInput.setAttribute("disabled", true);
            slotInput.value = "";

            const enchSlotInput = slotInput.nextElementSibling;
            enchSlotInput.setAttribute("disabled", true);
            enchSlotInput.value = "";
        }

        for (let i = 0; i <= sl; i++) {
            const select = slotsContainer.querySelector(`select[data-i='${i}']`);
            select.removeAttribute("disabled");
        }


        mainStat.innerText = `${obj.gear.name} ${obj.gear.main_stat.min_value + (obj.gear.main_stat.step * inputLevel.value) + (obj.gear.gain_per_trans * obj.trans.value)}`;
        this.updateDetails();
    });

    transLessDiv.addEventListener("click", e => {
        if (obj.trans.disabled) return;
        if (obj.trans.value === obj.trans.min) return;
        const transImg = document.getElementById(`trans-${obj.i}-img-${obj.trans.value}`);
        transImg.classList.remove("on-trans");
        obj.trans.value -= obj.trans.step;

        mainStat.innerText = `${obj.gear.name} ${obj.gear.main_stat.min_value + (obj.gear.main_stat.step * inputLevel.value) + (obj.gear.gain_per_trans * obj.trans.value)}`;

        slotTransSelect.options[0].selected = true;
        slotTransSelect.setAttribute("disabled", true);

        slotTransInput.setAttribute("disabled", true);
        slotTransInput.value = "";

        enchSlotTransInput.setAttribute("disabled", true);
        enchSlotTransInput.value = "";

        this.updateDetails();
    });

    transMoreDiv.addEventListener("click", e => {
        if (obj.trans.disabled) return;
        if (obj.trans.value === obj.trans.max) return;
        obj.trans.value += obj.trans.step;
        if (obj.trans.value === obj.trans.max) {
            slotTransSelect.removeAttribute("disabled");
        }
        const transImg = document.getElementById(`trans-${obj.i}-img-${obj.trans.value}`);
        transImg.classList.add("on-trans");

        mainStat.innerText = `${obj.gear.name} ${obj.gear.main_stat.min_value + (obj.gear.main_stat.step * inputLevel.value) + (obj.gear.gain_per_trans * obj.trans.value)}`;
        this.updateDetails();
    });   

    div.appendChild(bgDiv);
    div.appendChild(mainLevelContainer);
    div.appendChild(mainStat);

    div.appendChild(slotsContainer);

    container.appendChild(div);
}

async function getData(file) {
    try {
    const response = await fetch(file)
    if (!response.ok) {
        throw new Error('Erreur lors de la requête : ' + response.statusText);
    }
    const data = await response.json();
    return data;
    } catch(error) {
        console.error('Erreur :', error);
    }
} 

function setCharacters() {
    const charSelect = document.getElementById("characters");
    const characterCard = document.getElementById("character-card");
    const dupeContainer = document.getElementById("dupe-container");
    const dupeLess = document.getElementById("dupe-less");
    const dupeMore = document.getElementById("dupe-more");
    const charImg = document.getElementById("character-img");
    const charClass = document.getElementById("char-class");
    const levelContainer = document.getElementById("char-class-container");
    const levelMore = document.getElementById("char-level-more");
    const levelLess = document.getElementById("char-level-less");
    const levelSpan = document.getElementById("char-level");
    const charTooltip = document.getElementById("character-tooltip");

    if (this.charLevels.disabled) {
        levelContainer.classList.add("disabled");
        levelSpan.setAttribute("disabled", true);
    }
    levelMore.addEventListener("click", e => {
        if (this.charLevels.disabled) return;
        if (this.charLevels.value === this.charLevels.max) return;
        const char = this.data.character.find(c => charSelect.value === c.type);
        if (char.trans.length === 0) return;
        this.charLevels.value += this.charLevels.step;
        levelSpan.value = this.charLevels.value;
        this.updateDetails();
    });
    levelLess.addEventListener("click", e => {
        if (this.charLevels.disabled) return;
        if (this.charLevels.value === this.charLevels.min) return;
        const char = this.data.character.find(c => charSelect.value === c.type);
        if (char.trans.length === 0) return;
        this.charLevels.value -= this.charLevels.step;
        levelSpan.value = this.charLevels.value;
        this.updateDetails();
    });
    levelSpan.addEventListener("change", e => {
        const char = this.data.character.find(c => charSelect.value === c.type);
        if (char.trans.length === 0) {
            e.target.value = this.charLevels.min;
            return;
        }
        if (e.target.value > this.charLevels.max) {
            e.target.value = this.charLevels.max;
            this.charLevels.value = this.charLevels.max;
        } else if (e.target.value < this.charLevels.min) {
            e.target.value = this.charLevels.min;
            this.charLevels.value = this.charLevels.min;
        } else {
            this.charLevels.value = parseInt(e.target.value);
        }
        this.updateDetails();
    });


    if (this.charDupes.disabled) dupeContainer.classList.add("disabled");
    dupeLess.addEventListener("click", e => {
        if (this.charDupes.disabled) return;
        if (this.charDupes.value === this.charDupes.min) return;
        const dupe = document.getElementById(`dupe-${this.charDupes.value}`);
        dupe.src = "./img/external/character/no_dupe.png";
        this.charDupes.value -= this.charDupes.step;
        this.updateDetails();
    });

    dupeMore.addEventListener("click", e => {
        if (this.charDupes.disabled) return;
        if (this.charDupes.value === this.charDupes.max) return;
        this.charDupes.value += this.charDupes.step;
        const dupe = document.getElementById(`dupe-${this.charDupes.value}`);
        dupe.src = "./img/external/character/dupe.png";
        this.updateDetails();
    });    

    const emptyCharOption = document.createElement("option");
    emptyCharOption.value = "empty";
    emptyCharOption.innerText = "Select a character...";
    charSelect.appendChild(emptyCharOption);
    
    this.data.character.forEach(c => {
        const charOption = document.createElement("option");
        charOption.value = c.type;
        charOption.innerText = c.name;
        if (c.type) charSelect.appendChild(charOption);
    });

    charSelect.addEventListener("change", e => {
        this.charLevels.value = 100;

        if (e.target.value !== "empty") {
            levelSpan.removeAttribute("disabled");
            this.charLevels.disabled = false;
            dupeContainer.classList.remove("disabled");
            this.charDupes.disabled = false;
            levelSpan.value = this.charLevels.value;
            
            characterCard.classList.remove("card-sr");
            characterCard.classList.remove("card-ssr");
            characterCard.classList.remove("card-no-card");
            const char = this.data.character.find(c => c.type === e.target.value);
            characterCard.classList.add(`card-${char.quality}`);
            charClass.src = `./img/external/character/${char.class}.png`;

            if (char.trans.length === 0) {
                charTooltip.classList.add("visible");
                levelContainer.classList.add("disabled");
            } else {
                charTooltip.classList.remove("visible");
                levelContainer.classList.remove("disabled");
            }
        } else {
            levelContainer.classList.add("disabled");
            levelSpan.setAttribute("disabled", true);
            this.charLevels.disabled = true;
            levelSpan.value = "∅";

            dupeContainer.classList.add("disabled");
            this.charDupes.value = 0;
            this.charDupes.disabled = true;
            for (let i = 1; i <= this.charDupes.max; i++) {
                const dupe = document.getElementById(`dupe-${i}`);
                dupe.src = "./img/external/character/no_dupe.png";
            }
            characterCard.classList.remove("card-sr");
            characterCard.classList.remove("card-ssr");
            characterCard.classList.add("card-no-char");

            charClass.src = "./img/external/character/no_class.png";
            charTooltip.classList.remove("visible");
        }

        charImg.src = `./img/external/character/portrait/${e.target.value}.png`;
        this.updateDetails();
    });
}

function updateDetails() {
    const detailAtk = document.getElementById("detail-atk");
    const detailMatk = document.getElementById("detail-matk");
    const detailDef = document.getElementById("detail-def");
    const detailHP = document.getElementById("detail-hp");
    const detailAcc = document.getElementById("detail-acc");
    const detailCrate = document.getElementById("detail-crate");
    const detailCdmg = document.getElementById("detail-cdmg");
    const detailCres = document.getElementById("detail-cres");
    const detailSpd = document.getElementById("detail-spd");
    const detailPen = document.getElementById("detail-pen");
    const detailEnd = document.getElementById("detail-end");
    const detailDmgres = document.getElementById("detail-dmgres");

    const gearStatsElem = document.getElementById("gear-stats");
    const accStatsElem = document.getElementById("acc-stats");

    // Character
    const character = document.getElementById("characters");
    const charStats = this.data.character.find(c => character.value === c.type);
    const detailStats = charStats ? JSON.parse(JSON.stringify(charStats)) : null;

    const tempStats = {
        "atk": 0,
        "matk": 0,
        "atk%": 0,
        "matk%": 0,
        "def": 0,
        "def%": 0,
        "hp": 0,
        "hp%": 0,
        "acc": 0,
        "dmgres": 0,
        "crate": 0,
        "cdmg": 0,
        "cres": 0,
        "pen": 0,
        "end": 0,
        "spd": 0
    }

    // CHARACTER
    if (detailStats) {
        for (const [key, value] of Object.entries(tempStats)) {
            tempStats[key] += detailStats[key] || 0; // character stats
            for (let i = 1; i <= this.charDupes.value; i++) {
                const dupe = detailStats.dupes.find(d => d.dupe == i);
                if (dupe) {
                    tempStats[key] += (dupe[key] || 0); // character dupes
                }
            }

            // Level - 100 because characters starts lvl100
            tempStats[key] += (detailStats.gain_per_level[key] * (this.charLevels.value - 100)) || 0;
            
            const transArray = detailStats.trans.filter(t => t.max_lvl <= this.charLevels.value);
            for (const trans of transArray) {
                tempStats[key] += trans.stats[key] || 0;
            }
        };
    }

    // GEAR
    for (let i = 0; i < gearStatsElem.childNodes.length; i++) {
        const gear = this.equipped.gears[i].gear;
        const trans = this.equipped.gears[i].trans;
        const child = gearStatsElem.childNodes[i];
        const inputLevel = child.getElementsByClassName("input-level")[0];

        // Gear main stat + level + transcendance
        tempStats[gear.main_stat.type] += gear.main_stat.min_value + (gear.main_stat.step * inputLevel.value) + (gear.gain_per_trans * trans.value);

        // Gear slots + enchant
        const slots = child.getElementsByClassName("slot-select");
        [...slots].forEach(inputSlot => {
            if (inputSlot.value === "empty") return;
            const slot = inputSlot.nextElementSibling;
            const ench = slot.nextElementSibling;
            tempStats[inputSlot.value] += parseFloat(slot.value) + (parseFloat(ench.value) || 0);
        });
    }

    // ACCESSORY
    for (let i = 0; i < accStatsElem.childNodes.length; i++) {
        const acc = this.equipped.accessories[i].acc;
        const child = accStatsElem.childNodes[i];
        const inputLevel = child.getElementsByClassName("input-level")[0];

        // Acc main stat + level
        tempStats[acc.main_stat.type] += acc.main_stat.min_value + (acc.main_stat.step * inputLevel.value);

        // ACC slots + enchant
        const slots = child.getElementsByClassName("slot-select");
        [...slots].forEach(inputSlot => {
            if (inputSlot.value === "empty") return;
            const slot = inputSlot.parentElement.getElementsByClassName("input-slot")[0];
            const ench = inputSlot.parentElement.getElementsByClassName("input-ench")[0];
            tempStats[inputSlot.value] += parseFloat(slot.value, 10) + (parseFloat(ench.value,10) || 0);
        });
    }

    // TALENT STONE
    this.equipped.talents.forEach(obj => {
        obj.talent.stats.forEach(stat => {
            tempStats[stat.type] += stat.value;
        });
    });

    detailAtk.innerText = toFixed(tempStats.atk * (1 + tempStats["atk%"] / 100), 0);
    detailMatk.innerText = toFixed(tempStats.matk * (1 + tempStats["matk%"] / 100), 0);
    detailDef.innerText = toFixed(tempStats.def * (1 + tempStats["def%"] / 100), 0);
    detailHP.innerText = toFixed(tempStats.hp * (1 + tempStats["hp%"] / 100), 0);
    detailAcc.innerText = tempStats.acc;
    detailCrate.innerText = toFixed(tempStats.crate,2) + "%";
    detailCdmg.innerText = toFixed(tempStats.cdmg,2) + "%";
    detailCres.innerText = toFixed(tempStats.cres,2) + "%";
    detailSpd.innerText = tempStats.spd;
    detailPen.innerText = tempStats.pen;
    detailEnd.innerText = tempStats.end;
    detailDmgres.innerText = tempStats.dmgres;
}

function handleSlotInputChange(si, slotStats, rankElem) {
    const value = parseFloat(si.target.value);
    if (value > slotStats.max_value) si.target.value = slotStats.max_value;
    if (value < slotStats.min_value) si.target.value = slotStats.min_value;

    this.updateRank(parseFloat(si.target.value), slotStats, rankElem);
    this.updateDetails();
}

function updateRank(value, stats, rankElem) {
    return;

    // Don't know the rank distribution so i wont do it for now
    if (value === 0 || value === "") rankElem.src = "";
    else if (value === stats.max_value) rankElem.src = "./img/external/common/rank_ss.png";
    else {
        const ratio = (stats.max_value - stats.min_value) / 4;
        if (value <= stats.min_value + ratio * 1) rankElem.src = "./img/external/common/rank_c.png";
        else if (value <= stats.min_value + ratio * 2) rankElem.src = "./img/external/common/rank_b.png";
        else if (value <= stats.min_value + ratio * 3) rankElem.src = "./img/external/common/rank_a.png";
        else if (value <= stats.min_value + ratio * 4) rankElem.src = "./img/external/common/rank_s.png";
    }
}

function handleEnchSlotInputChange(si, enchStats, rankElem) {
    const value = parseFloat(si.target.value);
    if (value > enchStats.max_value) si.target.value = enchStats.max_value;
    if (value < enchStats.min_value && value !== 0) si.target.value = enchStats.min_value;

    this.updateRank(parseFloat(si.target.value), enchStats, rankElem);
    this.updateDetails();
}

function toFixed(num, fixed) {
    var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
    return num.toString().match(re)[0];
}