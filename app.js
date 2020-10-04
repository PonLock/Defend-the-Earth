//document.addEventListener("DOMContentLoaded", () => {
    let earthHp = 20
    let alienShipHp = 15
    let score = 0
    let timeGame = 60
    let timeGameId = null
    let timeShootId = null
    let meteorDivCopy = null
    let alienShipDivCopy = null
    let shootDivCopy = null
    // variables for operation bonus countdown timer
    let slowMeteorTimeId = null //setInterval
    let bonusTimeId = null  //setTimeout
    // protect bonus
    let protectEarthTimeId = null //setInterval
    let protectBonusTimeId = null //setTimeout
    //
    let oneTimeSpawnShip = false
    let alienOnMap = false
    let spawnBool = true
    let speedDownMoveMeteor = false
    let protectEarthBonus = false
    let bonusInfoActive = false
    const displayBonusTime = 1.5 // sec

    const gameContainer = document.querySelector(".board")
    const earthImg = document.querySelector(".earth")
    const gameStartBtn = document.querySelector(".btn")
    const msgDisplay = document.querySelector(".msg")
    const earthHpDisplay = document.querySelector(".life")
    const scoreDisplay = document.querySelector(".score")
    const timeDisplay = document.querySelector(".time")
    const shipHpDisplay = document.querySelector(".ship__hp")
    const shieldTimeDisplay = document.querySelector(".shield__time")
    const slowTimeDisplay = document.querySelector(".time__bonus")
    const showBonusInfoMsg = document.querySelector(".bonus__info")
    const showDmg = document.querySelector(".show__dmg")
    const shieldDiv = document.createElement("div")

    earthHpDisplay.textContent =`${earthHp}`
    timeDisplay.textContent = `Time: ${timeGame}`
    msgDisplay.style.display = "none"
    shipHpDisplay.style.display = "none"
    shieldTimeDisplay.style.display = "none"
    slowTimeDisplay.style.display = "none"
    showBonusInfoMsg.style.display = "none"
    showDmg.style.display = "none"
    scoreDisplay.style.color = ""

    // scaling || default size 800x800
    const gameContainerWidth = gameContainer.offsetWidth
    const gameContainerHeight = gameContainer.offsetHeight
    const scaleY = (525/800) * gameContainerHeight
    const scaleYoutMap = (735/800) * gameContainerHeight
    const scaleXone = (230/800) * gameContainerWidth
    const scaleXtwo = (500/800) * gameContainerWidth
    const scaleLeft = (390/800) * gameContainerWidth
    let currentShootPossitionY = (135/800) * gameContainerHeight
    //

    class Meteor {
        constructor(img, dmg, speed) {
          this.img = img
          this.dmg = dmg
          this.speed = speed
          this.timerId = null
          this.randomPossitionX = null
          this.possitionY = null
        }
    }    
    
    meteors = [
        new Meteor("url(/img/meteor/001-rock.png)", 1, 13),
        new Meteor("url(/img/meteor/004-comet-1.png)", 2, 12),
        new Meteor("url(/img/meteor/006-meteorite.png)", 2, 11),
        new Meteor("url(/img/meteor/002-comet.png)", 3, 10),
        new Meteor("url(/img/meteor/003-meteor.png)", 4, 9),
        new Meteor("url(/img/meteor/007-meteor-2.png)", 5, 7),
        new Meteor("url(/img/meteor/005-meteor-1.png)", 7, 8)
    ]

    function spawnAlienShip(){
        const alienShipDiv = document.createElement("div")
        alienShipDiv.classList.add("big")
        gameContainer.appendChild(alienShipDiv)
        alienOnMap = true
        oneTimeSpawnShip = true

        // display ship HP
        shipHpDisplay.style.display = ""
        shipHpDisplay.textContent = alienShipHp

        alienShipDiv.addEventListener("click", () => {
            alienShipHp--
            shipHpDisplay.textContent = alienShipHp
            
            if (alienShipHp === 0){
                score += 10
                scoreDisplay.textContent = `Score: ${score}`
                showBonusInfoMsg.style.display = ""
                showBonusInfoMsg.textContent = `Score +10`
                setTimeout(() =>{
                    showBonusInfoMsg.style.display = "none"
                }, 1.5*1000)
                alienOnMap = false
                alienShipDiv.remove()
                shipHpDisplay.style.display = "none"
                shootClear()
                spawnBonus()
            }
        })
    
        alienShipDivCopy = alienShipDiv
        shootFromAlien()
    }

    function shootFromAlien(){
        const shootDiv = document.createElement("div")
        shootDiv.classList.add("shoot")
        shootDiv.style.top = currentShootPossitionY + "px"
        shootDiv.style.left = scaleLeft + "px"
        gameContainer.appendChild(shootDiv)

        shootDivCopy = shootDiv

        // move shoot form alien's ship to Earth
        timeShootId = setInterval(function(){
            chceckPossition()
            currentShootPossitionY += 16
            shootDivCopy.style.top = currentShootPossitionY + "px"
        },10)
    }

    function randomTimeSpawnAlienShip(){
                                    //max time, min time
        return timeSpawnAlienShip = Math.floor(Math.random()*(50 - 10 + 1)+10)
    }  

    class Bonus{
        constructor(img, bonus){
            this.img = img
            this.bonus = bonus
        }

        heartUp(){
            earthHp += this.bonus
            earthHpDisplay.textContent =`${earthHp}`
            showBonusInfoMsg.style.display = ""
            showBonusInfoMsg.textContent = `Life +${this.bonus}`
            if (earthHp > 10) earthImg.style.backgroundImage = "url(/img/earth.png)"
            setTimeout(() =>{
                showBonusInfoMsg.style.display = "none"
            }, 1.5*1000)
        }

        scoreUp(){
            score += this.bonus
            scoreDisplay.textContent = `Score: ${score}`
            showBonusInfoMsg.style.display = ""
            showBonusInfoMsg.textContent = `Score +${this.bonus}`
            setTimeout(() =>{
                showBonusInfoMsg.style.display = "none"
            }, 1.5*1000)
        }

        timeUp(){
            timeGame += this.bonus
            timeDisplay.textContent = `Time: ${timeGame}`
            showBonusInfoMsg.style.display = ""
            showBonusInfoMsg.textContent = `Time +${this.bonus}`
            setTimeout(() =>{
                showBonusInfoMsg.style.display = "none"
            }, 1.5*1000)
        }

        speedMeteorDown(){
            let decTime = this.bonus
            if (speedDownMoveMeteor === true){ 
                clearTimeout(bonusTimeId)
                clearInterval(slowMeteorTimeId)
                this.bonus += 10 
                setTimeout(() =>{
                    speedDownMoveMeteor = false
                    clearInterval(slowMeteorTimeId)
                    slowTimeDisplay.style.display = "none"
                    this.bonus = 10 //fix duration bonus after time out
                }, (this.bonus + decTime)*1000)
            }
            speedDownMoveMeteor = true
            slowTimeDisplay.style.display = ""
            slowTimeDisplay.textContent = `| Slow ${this.bonus}`
            slowMeteorTimeId = setInterval(() => {
                this.bonus--
                slowTimeDisplay.textContent = `| Slow ${this.bonus}`
            },1000)
            
            
            bonusTimeId = setTimeout(() =>{
                speedDownMoveMeteor = false
                clearInterval(slowMeteorTimeId)
                slowTimeDisplay.style.display = "none"
                this.bonus = 10 //fix duration bonus after time out
            }, this.bonus *1000)
        }    

        erathProtect(){
            let decTimeProtect = this.bonus
            if (protectEarthBonus === true){
                clearTimeout(protectBonusTimeId)
                clearInterval(protectEarthTimeId)
                this.bonus += 5 
                setTimeout(() =>{
                    shieldDiv.remove()
                    protectEarthBonus = false
                    clearInterval(protectEarthTimeId)
                    shieldTimeDisplay.style.display = "none"
                    this.bonus = 5 //fix duration bonus after time out
                }, (this.bonus + decTimeProtect)*1000) //duration time
            }
            shieldDiv.classList.add("earth__shield")
            gameContainer.appendChild(shieldDiv)
            protectEarthBonus = true
            shieldTimeDisplay.style.display = ""
            shieldTimeDisplay.textContent = this.bonus

            protectEarthTimeId = setInterval(() =>{
                this.bonus--
                shieldTimeDisplay.textContent = this.bonus
            },1000)

            protectBonusTimeId = setTimeout(() =>{
                shieldDiv.remove()
                protectEarthBonus = false
                clearInterval(protectEarthTimeId)
                shieldTimeDisplay.style.display = "none"
                this.bonus = 5 //fix duration bonus after time out
            }, this.bonus*1000) //duration time
        }
    }

    bonuses = [
        heartBonus = new Bonus("url(/img/bonus/heart_bonus.gif)", 3),
        scoreBonus = new Bonus("url(/img/bonus/star_bonus.png)", 10),
        protectBonus = new Bonus("url(/img/bonus/shield_bonus.png)", 5),
        timeBonus = new Bonus("url(/img/bonus/clock.png)", 10),
        slowMeteor = new Bonus("url(/img/bonus/slow-motion.png)", 10)
    ]

    scalingBonusesPossition = [
    // x                                y
    [(250/800) * gameContainerWidth, (450/800) * gameContainerHeight],
    [(330/800) * gameContainerWidth, (430/800) * gameContainerHeight],
    [(465/800) * gameContainerWidth, (235/800) * gameContainerHeight],
    [(440/800) * gameContainerWidth, (545/800) * gameContainerHeight],
    [(410/800) * gameContainerWidth, (655/800) * gameContainerHeight],
    [(725/800) * gameContainerWidth, (150/800) * gameContainerHeight]
    ]

    function spawnBonus(){
        randomBonus()
        randomBonusPossition()

        const bonusDiv = document.createElement("div")
        bonusDiv.classList.add("bonuses")
        bonusDiv.style.top = currentBonusPossition[0] + "px"
        bonusDiv.style.left = currentBonusPossition[1] + "px"
        bonusDiv.style.backgroundImage = currentBonus.img

        gameContainer.appendChild(bonusDiv)
        
        bonusDiv.addEventListener("click", () =>{
            bonusDiv.remove()
            switch(currentBonus){
                case heartBonus: 
                    heartBonus.heartUp() 
                    break

                case scoreBonus: 
                    scoreBonus.scoreUp()
                    break

                case protectBonus: 
                    protectBonus.erathProtect()
                    break

                case timeBonus: 
                    timeBonus.timeUp()
                    break

                case slowMeteor: 
                    slowMeteor.speedMeteorDown()
                    break

                default:
                console.log(`Bonus error ${currentBonus}`)
            }
        })

        setTimeout(() =>{
            bonusDiv.remove()
        }, displayBonusTime*1000)
    }

    function randomBonusPossition(){
        let randomBonusPossition = Math.floor(Math.random()*scalingBonusesPossition.length)
        return currentBonusPossition = scalingBonusesPossition[randomBonusPossition]
    }

    function randomBonus(){
        let randomBonus = Math.floor(Math.random()*bonuses.length)
        return currentBonus = bonuses[randomBonus]
    }

    function randomMeteor(){
        let random = Math.floor(Math.random()*meteors.length)
        return current = meteors[random]
    }

    function randomPossitionX(){
        //return randomNew = Math.floor(Math.random()*(730 - 0 + 1) + 0)
        return randomNew = Math.floor(Math.random()*((gameContainerWidth - 50) - 0 + 1) + 0)
    }

    function spawnMeteor(){
        randomMeteor()
        randomPossitionX()

        const meteorDiv = document.createElement("div")
        meteorDiv.classList.add("meteor")
        meteorDiv.style.left = randomNew + "px"
        meteorDiv.style.top = current.possitionY + "px"
        meteorDiv.style.backgroundImage = current.img
        gameContainer.appendChild(meteorDiv)

        current.randomPossitionX = randomNew
        meteorDivCopy = meteorDiv

        meteorDiv.addEventListener("mouseenter", () =>{
            boomInMeteor(current.possitionY, current.randomPossitionX, 300)
            clearSpawnMeteor()
            score++
            scoreDisplay.textContent =`Score: ${score}`
        })
 
        moveMeteor()
    }

    function moveMeteor(){
        current.timerId = setInterval(function(){
            chceckPossition()
            // speed meteor and slow bonus  || slow bonus           || normal speed
            if (gameContainerHeight < 800)
                speedDownMoveMeteor === true ? current.possitionY += 1 : current.possitionY += (current.speed / 1.525) 
            else
                speedDownMoveMeteor === true ? current.possitionY += 1 : current.possitionY += current.speed
            meteorDivCopy.style.top = current.possitionY + "px"
        }, 15)
    }

    function chceckPossition(){
        if(current.possitionY > scaleY && 
            current.randomPossitionX > scaleXone && 
            current.randomPossitionX < scaleXtwo){
            if (protectEarthBonus === false) 
            earthHp -= current.dmg
            earthHpDisplay.textContent =`${earthHp}`
            boomInEarth(current.possitionY, current.randomPossitionX, true)
            clearSpawnMeteor()
        }else if (current.possitionY >= scaleYoutMap){
            clearSpawnMeteor()
        }else if (currentShootPossitionY > scaleY && alienOnMap === true){
            if (protectEarthBonus === false) 
            earthHp -= 1
            earthHpDisplay.textContent =`${earthHp}`
            boomInEarth(scaleY, scaleLeft)
            shootClear()
        }
        if (earthHp <= 10) earthImg.style.backgroundImage = "url(/img/earth-hp10.png)"
        if (earthHp <= 0){
            earthImg.style.backgroundImage = "url(/img/moon-phase.png)"
            earthHp = 0
            msgDisplay.style.display = ""
            msgDisplay.textContent= "You have failed"
            endGame()
        }
    }

    function endGame(){
        spawnBool = false
        clearSpawnMeteor()
        resetGameTime()
        earthHpDisplay.textContent =`${earthHp}`
        gameStartBtn.style.display = ""
        shipHpDisplay.style.display = "none"
        slowTimeDisplay.style.display = "none"
        showBonusInfoMsg.style.display = "none"
        scoreDisplay.style.color = "yellowgreen"
        alienOnMap = false 
        oneTimeSpawnShip = false
        shootClear()
        //fix alienShipDivCopy is null
        if(alienShipDivCopy != null) alienShipDivCopy.remove()
    }
    function decTimeGame(){
        timeGame--
        timeDisplay.textContent = `Time: ${timeGame}`
               
        if (timeGame > 1 && timeGame % 20 === 0) spawnBonus()

        if (timeGame === timeSpawnAlienShip && oneTimeSpawnShip === false) spawnAlienShip()

        if((timeGame === 0 && alienOnMap === true) || (timeGame === 0  && earthHp > 0 && alienOnMap === true)){
            msgDisplay.style.display = ""
            msgDisplay.textContent= "You have failed"
            endGame()
        }
        if(timeGame === 0 && earthHp > 0 && alienOnMap === false)
        {
            msgDisplay.style.display = ""
            msgDisplay.textContent= "Earth defended"
            score += 100 + earthHp
            scoreDisplay.textContent = `Score: ${score}`
            endGame()
        }
    }

    function startGameTime(){
        timeGameId = setInterval(decTimeGame, 1000)
    }


    function boomInEarth(possY, possX, showDmgFromMeteor){
        const scaleBoomFix = (290/800) * gameContainerWidth
        let showDmgMeteor = showDmgFromMeteor
        const boomDivEarth = document.createElement("div")
        boomDivEarth.classList.add("boomInEarth")
       
        if(possX < scaleBoomFix){
            possX = scaleBoomFix
        }
        boomDivEarth.style.top = possY + "px"
        boomDivEarth.style.left = possX + "px"
        gameContainer.appendChild(boomDivEarth)

        if (showDmgMeteor === true){
            showDmg.style.top = (possY - 50) + "px"
            showDmg.style.left = (possX + 50) + "px"
            showDmg.style.display = ""
            showDmg.textContent = current.dmg

        }

        setTimeout(() => {
            boomDivEarth.remove()
            if (showDmgMeteor === true) showDmg.style.display = "none"
        },300)
    }

    function boomInMeteor(possY, possX, duration){
        const boomDivMeteor = document.createElement("div")
        boomDivMeteor.classList.add("boomInMeteor")
       
        boomDivMeteor.style.top = possY + "px"
        boomDivMeteor.style.left = possX + "px"
        gameContainer.appendChild(boomDivMeteor)

        setTimeout(() => {
            boomDivMeteor.remove()
        },duration)
    }

    function resetGameTime(){
        clearInterval(timeGameId)
        timeGameId = null
    }

    function resetSpeedTime(id){
        if (id === null) return
        clearInterval(id)
        id = null
    }

    function shootClear(){
        resetSpeedTime(timeShootId)
        shootDivCopy.remove()
        currentShootPossitionY = (135/800) * gameContainerHeight
        if (alienOnMap === true) shootFromAlien()
    }

    function clearSpawnMeteor(){
        resetSpeedTime(current.timerId)
        meteorDivCopy.remove()
        current.possitionY = 0
        if (spawnBool === true) spawnMeteor()
    }

    function resetGameOption(){
        earthHp = 20
        alienShipHp = 15
        score = 0
        timeGame = 60
        timeGameId = null
        timeShootId = null
        meteorDivCopy = null
        alienShipDivCopy = null
        shootDivCopy = null
        currentShootPossitionY = (135/800) * gameContainerHeight
        oneTimeSpawnShip = false
        alienOnMap = false
        spawnBool = true
        speedDownMoveMeteor = false
        protectEarthBonus = false       
        earthHpDisplay.textContent =`${earthHp}`
        timeDisplay.textContent = `Time: ${timeGame}`
        scoreDisplay.textContent = `Score: ${score}`
        msgDisplay.style.display = "none"
        shipHpDisplay.style.display = "none"
        shieldTimeDisplay.style.display = "none"
        slowTimeDisplay.style.display = "none"
        showBonusInfoMsg.style.display = "none"
        showDmg.style.display = "none"
        scoreDisplay.style.color = ""
    }

    function startGame(){
        startGameTime()
        randomTimeSpawnAlienShip()
        spawnMeteor()
    }

    gameStartBtn.addEventListener("click", () =>{
        resetGameOption()
        gameStartBtn.style.display = "none"
        msgDisplay.style.display = ""
        msgDisplay.textContent = "Graphic authors: Icongeek26 Freepik @Flaticon"
        earthImg.style.backgroundImage = "url(/img/earth.png)"

        setTimeout(() => {
            msgDisplay.style.display = "none"
            startGame()
        },1500)
    })
//})