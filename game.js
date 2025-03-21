// Softporn Adventure - 80s Neon Web Edition
// Game logic adapted from the original 1981 Apple BASIC code

class SoftpornAdventure {
    constructor() {
        // Core game variables
        this.score = 0;
        this.money = 25; // $2500 in the original notation (hundreds)
        this.currentRoom = 3; // Start in the bar
        this.gameOver = false;
        
        // Game state flags
        this.drawerExamined = 0;
        this.toiletExamined = 0;
        this.drawerOpened = 0;
        this.closetOpened = 0;
        this.waterOn = 0;
        this.stoolUsed = 0;
        this.cabinetOpened = 0;
        this.idInflated = 0;
        this.tvOn = 0;
        this.girlPoints = 0;
        this.wineGiven = 0;
        this.wearingRubber = 0;
        this.usingRope = 0;
        this.blondeGirlDrugged = 0;
        this.wineBottle = 0;
        this.rescuedHooker = 0;
        this.dumpsterChecked = 0;
        this.appleCore = 0;
        this.appleSeeds = 0;
        this.tiedToBed = 0;
        this.doorUnlocked = 0;
        this.bushesFound = 0;
        this.pitcherFull = 0;
        this.jacuzziApple = 0;
        this.hookerDone = false;
        this.candyGiven = 0;
        this.whiskeybought = false;
        this.beerBought = false;
        this.magazineFound = 0;
        this.ashtreyExamined = 0;
        
        // Rubber properties
        this.rubberColor = null;
        this.rubberFlavor = null;
        this.rubberLubricated = false;
        this.rubberRibbed = false;
        
        // Blackjack game state
        this.blackjackState = {
            playerCards: [],
            dealerCards: [],
            playerTotal: 0,
            dealerTotal: 0,
            bet: 0,
            gamePhase: 'betting' // betting, player, dealer, result
        };
        
        // Initialize rooms, objects and inventory
        this.initializeRooms();
        this.initializeObjects();
        this.inventory = [];
        
        // Game output history
        this.gameOutput = [];
        
        // Map of verb to applicable object types
        this.verbToObjectTypes = {
            "TAKE": ["ITEM"],
            "DROP": ["INVENTORY"],
            "USE": ["INVENTORY", "USABLE"],
            "OPEN": ["OPENABLE"],
            "EXAMINE": ["ALL"],
            "LOOK": ["ALL"],
            "BUY": ["BUYABLE"],
            "TALK": ["CHARACTER"],
            "PUSH": ["PUSHABLE"],
            "WEAR": ["WEARABLE"]
        };
    }
    
    // Choose a door in the game over screen
    chooseDoor(door) {
        try {
            door = parseInt(door);
            
            // Randomly determine outcome
            const fate = Math.floor(Math.random() * 4);
            
            if (door === fate) {
                // Back to life
                this.addToGameDisplay(`<div class="message">YOU'VE BEEN GRANTED ANOTHER CHANCE!</div>`);
                this.displayRoom();
                return;
            }
            
            door = door - 1;
            if (door < 1) door = 3;
            
            if (door === fate) {
                // Game over
                this.addToGameDisplay(`<div class="message">GAME OVER! WELCOME TO HELL!</div>`);
                this.addToGameDisplay(`<div class="system-message">REFRESH THE PAGE TO PLAY AGAIN.</div>`);
                return;
            }
            
            // Stay in purgatory
            this.addToGameDisplay(`<div class="message">YOU'RE STILL HERE!</div>`);
            this.addToGameDisplay(`<div class="system-message">
                CHOOSE YOUR DOOR: 
                <button id="door-1">1</button> 
                <button id="door-2">2</button> 
                <button id="door-3">3</button>
            </div>`);
        } catch (error) {
            console.error("Error in chooseDoor:", error);
            this.addToGameDisplay(`<div class="message">SOMETHING WENT WRONG IN PURGATORY!</div>`);
        }
    }
    
    // Start the game
    start() {
        try {
            // Display intro text
            this.addToGameDisplay(`<div class="message">
                SOFTPORN ADVENTURE
                WRITTEN BY CHUCK BENTON
                COPYRIGHT 1981
                BLUE SKY SOFTWARE
                
                80s NEON WEB EDITION
            </div>`);
            
            // Ask if a saved game should be loaded (for authenticity, though not implemented)
            this.addToGameDisplay(`<div class="system-message">SHOULD A SAVED GAME BE LOADED? <button id="no-load">N</button></div>`);
        } catch (error) {
            console.error("Error starting game:", error);
            this.addToGameDisplay(`<div class="message">ERROR STARTING GAME. PLEASE REFRESH.</div>`);
        }
    }
    
    // Initialize game after intro
    initializeGame() {
        try {
            this.addToGameDisplay(`<div class="message">
                PLEASE WAIT
                INITIALIZATION PHASE
            </div>`);
            
            setTimeout(() => {
                // Display the starting room
                this.displayRoom();
            }, 1000);
        } catch (error) {
            console.error("Error initializing game:", error);
            this.addToGameDisplay(`<div class="message">ERROR INITIALIZING GAME. PLEASE REFRESH.</div>`);
        }
    }
    
    // Drop an object
    dropObject(noun) {
        try {
            if (!noun) {
                this.addToGameDisplay(`<div class="message">DROP WHAT?</div>`);
                return;
            }
            
            // Convert noun to object ID
            const objectId = this.getObjectId(noun);
            
            if (!objectId) {
                this.addToGameDisplay(`<div class="message">I DON'T HAVE THAT!!</div>`);
                return;
            }
            
            // Check if the object is in inventory
            if (!this.isObjectInInventory(objectId)) {
                this.addToGameDisplay(`<div class="message">I DON'T HAVE IT!!</div>`);
                return;
            }
            
            // Remove from inventory and add to the room
            this.removeFromInventory(objectId);
            this.addToRoom(objectId);
            
            this.addToGameDisplay(`<div class="message">OK</div>`);
            
            // Special checks for giving items to characters
            if (this.currentRoom === 21) { // In the disco
                if (objectId === 60) { // Candy
                    if (this.candyGiven === 0 && this.girlPoints < 3) {
                        this.girlPoints += 1;
                        this.candyGiven = 1;
                        this.addToGameDisplay(`<div class="message">SHE SMILES AND EATS A COUPLE!!</div>`);
                    }
                } else if (objectId === 57) { // Flowers
                    if (this.girlPoints < 3) {
                        this.girlPoints += 1;
                        this.addToGameDisplay(`<div class="message">SHE BLUSHES PROFUSELY AND PUTS THEM IN HER HAIR!</div>`);
                    }
                } else if (objectId === 51) { // Wedding ring
                    if (this.girlPoints < 3) {
                        this.girlPoints += 1;
                        this.addToGameDisplay(`<div class="message">SHE BLUSHES AND PUTS IT IN HER PURSE.</div>`);
                    }
                }
                
                // Check if we've given all the gifts
                if (this.girlPoints === 3) {
                    this.addToGameDisplay(`<div class="message">SHE SAYS 'SEE YOU AT THE MARRIAGE CENTER!!</div>`);
                    this.girlPoints = 4;
                    // Move the girl to the marriage center
                    this.removeFromRoom(21, 49);
                    this.addToRoomById(12, 49);
                }
            } else if (this.currentRoom === 22 && objectId === 72) { // Giving wine to bum
                if (this.wineGiven === 0) {
                    this.addToGameDisplay(`<div class="message">HE LOOKS AT ME AND STARTS TO SPEAK...</div>`);
                    this.addToGameDisplay(`<div class="message">AFTER ALL YOU MAY GET IN A PROGRAM BUG</div>`);
                    this.addToGameDisplay(`<div class="message">LIKE I DID!!!</div>`);
                    this.addToGameDisplay(`<div class="message">HE THROWS UP AND GIVES ME BACK THE WINE</div>`);
                    this.wineGiven = 1;
                    // Add a knife to the room
                    this.addToRoom(66);
                }
            } else if (this.currentRoom === 26 && objectId === 75) { // Giving apple to girl in jacuzzi
                this.addToGameDisplay(`<div class="message">SHE TAKES THE APPLE AND RAISES IT TO HER MOUTH. WITH AN OUTRAGEOUSLY INNOCENT LOOK SHE TAKES A SMALL BITE OUT OF IT.</div>`);
                this.addToGameDisplay(`<div class="message">A SMILE COMES ACROSS HER FACE! SHE'S REALLY STARTING TO LOOK QUITE SEXY!!!!</div>`);
                this.addToGameDisplay(`<div class="message">SHE WINKS AND LAYS BACK INTO THE JACUZZI</div>`);
                this.jacuzziApple = 1;
            } else if (this.currentRoom === 19 && objectId === 61 && this.blondeGirlDrugged === 0) { // Giving pills to blonde
                this.addToGameDisplay(`<div class="message">THE BLONDE LOOKS AT THE PILLS AND SAYS 'THANKS!!! I LOVE THIS STUFF!'</div>`);
                this.addToGameDisplay(`<div class="message">SHE TAKES A PILL..........HER NIPPLES START TO STAND UP! WOW!!!!</div>`);
                this.addToGameDisplay(`<div class="message">SHE'S BREATHING HEAVILY....I HOPE SHE RAPES ME!!!!!</div>`);
                this.addToGameDisplay(`<div class="message">SHE SAYS 'SO LONG!!! I'M GOING TO GO SEE MY BOYFRIEND!' SHE DISAPPEARS DOWN THE STAIRS........</div>`);
                this.blondeGirlDrugged = 1;
                // Remove blonde from the room
                this.removeFromRoom(19, 25);
            } else if (this.currentRoom === 1 && objectId === 52) { // Giving whiskey to guy in hallway
                this.addToGameDisplay(`<div class="message">THE GUY GIVES ME A TV CONTROLLER!!</div>`);
                this.removeFromInventory(52);
                this.addToRoom(84); // Add TV remote
            }
            
            // Update the UI to reflect inventory change
            this.updateUI();
            
            // Update the display
            this.displayRoom();
        } catch (error) {
            console.error("Error dropping object:", error);
            this.addToGameDisplay(`<div class="message">ERROR DROPPING OBJECT.</div>`);
        }
    }
    
    // Remove an item from inventory
    removeFromInventory(itemId) {
        try {
            const index = this.inventory.indexOf(itemId);
            if (index !== -1) {
                this.inventory.splice(index, 1);
            }
        } catch (error) {
            console.error("Error removing from inventory:", error);
        }
    }
    
    // Add content to the game display
    addToGameDisplay(content, className = "") {
        try {
            this.gameOutput.push({ content, className });
            // The actual display updating is handled by the UI
        } catch (error) {
            console.error("Error adding to game display:", error);
        }
    }
    
    // Game over
    gameOver() {
        try {
            this.addToGameDisplay(`<div class="message">
                WELCOME TO PURGATORY!! HERE AT THIS CROSSROADS YOU HAVE THREE OPTIONS:
                
                BEFORE YOU ARE THREE DOORS. EACH WILL BRING YOU TO A DIFFERENT PLACE- 
                A- TO HELL (WHERE THE GAME ENDS)
                B- BACK TO LIFE, UNHARMED
                C- YOU STAY HERE AND MUST CHOOSE AGAIN
                
                THE DOORS ARE RANDOMLY DIFFERENT EACH TIME!!
            </div>`);
            
            this.addToGameDisplay(`<div class="system-message">
                CHOOSE YOUR DOOR: 
                <button id="door-1">1</button> 
                <button id="door-2">2</button> 
                <button id="door-3">3</button>
            </div>`);
        } catch (error) {
            console.error("Error in gameOver:", error);
            this.addToGameDisplay(`<div class="message">GAME OVER! REFRESH TO PLAY AGAIN.</div>`);
        }
    }
    
    // Take an object
    takeObject(noun) {
        try {
            if (!noun) {
                this.addToGameDisplay(`<div class="message">TAKE WHAT?</div>`);
                return;
            }
            
            // Special case for inventory
            if (["INVENTORY", "INVE", "INV"].includes(noun.toUpperCase())) {
                this.showInventory();
                return;
            }
            
            // Convert noun to object ID
            const objectId = this.getObjectId(noun);
            
            if (!objectId) {
                this.addToGameDisplay(`<div class="message">I DON'T SEE THAT HERE!!</div>`);
                return;
            }
            
            // Check if the object is in the room
            if (!this.isObjectInRoom(objectId)) {
                this.addToGameDisplay(`<div class="message">I DON'T SEE IT HERE!!</div>`);
                return;
            }
            
            // Check if we can take this object (some might be fixed in place)
            if (objectId < 50) {
                this.addToGameDisplay(`<div class="message">I CAN'T DO THAT</div>`);
                return;
            }
            
            // Check if we're in the pharmacy and trying to steal
            if (this.currentRoom === 24 && (objectId === 69 || objectId === 68)) {
                this.addToGameDisplay(`<div class="message">THE MAN SAYS SHOPLIFTER!! AND SHOOTS ME</div>`);
                this.gameOver();
                return;
            }
            
            // Check if we're carrying too much
            if (this.inventory.length >= 8) {
                this.addToGameDisplay(`<div class="message">I'M CARRYING TOO MUCH!!!</div>`);
                return;
            }
            
            // Remove the object from the room and add to inventory
            this.removeFromRoom(this.currentRoom, objectId);
            this.inventory.push(objectId);
            
            this.addToGameDisplay(`<div class="message">OK</div>`);
            
            // Update the UI to reflect inventory change
            this.updateUI();
            
            // Update the display
            this.displayRoom();
        } catch (error) {
            console.error("Error taking object:", error);
            this.addToGameDisplay(`<div class="message">ERROR TAKING OBJECT.</div>`);
        }
    }
    
    // Remove an item from a room
    removeFromRoom(roomId, itemId) {
        try {
            if (this.roomObjects[roomId] && this.roomObjects[roomId].includes(itemId)) {
                const index = this.roomObjects[roomId].indexOf(itemId);
                if (index !== -1) {
                    this.roomObjects[roomId].splice(index, 1);
                }
            }
        } catch (error) {
            console.error("Error removing from room:", error);
        }
    }
    
    // Add an item to a specific room
    addToRoomById(roomId, itemId) {
        try {
            if (!this.roomObjects[roomId]) {
                this.roomObjects[roomId] = [];
            }
            if (!this.roomObjects[roomId].includes(itemId)) {
                this.roomObjects[roomId].push(itemId);
            }
        } catch (error) {
            console.error("Error adding to room by ID:", error);
        }
    }
    
    // Look at TV
    tvOnLook() {
        try {
            const channels = [
                `A MASKED MAN RUNS ACROSS THE SCREEN.\nJUMPING UP HE LANDS ON HIS HORSE AND YELLS 'HI-HO PLUTONIUM!!!!!\nHE RIDES OFF INTO A GREEN SKY.......\nNOTHING LIKE A GOOD OLD WESTERN TO PASS THE TIME.......`,
                `IT'S 'THE PRICE IS FRIGHT!!!!!!\n'AND NOW FOR OUR FAVORITE HOST..........HAUNTY MAULE!!!!!!!!!!\nHAUNTY JUMPS UP ON THE STAGE- HE ASKS 'AND WHO'S OUR FIRST LUCKY CONTESTANT?'\nTHE ANNOUNCER POINTS OUT A LADY...THE CROWD SCREAMS IN ECSTACY AS SHE'S DRAGGED TO THE STAGE............`,
                `CAPTAIN JERK LOOKS AT THE DOOR FROM WHICH BEHIND THE NOISE IS COMING.\nTHROWING OPEN THE DOOR- HIS FACE TURNS A DEEP RED!!!!!!!!!\nHE SAYS 'SCOTTY! WHAT ARE YOU DOING?? SCOTTY REPLIES 'BUT CAPTAIN!?!? MY GIRL AND I- WE'RE ENGAGED!!!!\nJERK COMMANDS 'WELL THEN DISENGAGE!'....AS THE STARSHIP THRUSTED FORWARD........PENETRATING DEEPER INTO SPACE..........`,
                `MR. RODJERKS JUMPS UP WITH HIS BIG SNEAKERS AND SAYS IN HIS CHEERY VOICE..\nGUESS WHAT- BOYS AND GIRLS?????? TODAY WE'RE GOING TO LEARN ABOUT SUCKERS!!\nSUSIE...SEE THE LOLLY-POP???? CAN YOU STICK IT IN YOUR MOUTH??? THAT'S RIGHT!\nTHAT'S A NICE LOLLY-POP....NICE AND HARD RIGHT?!?!?!?.................`,
                `CABLE TV!!!!!!!!\nTHERE SHOWING THE KINKIEST X-RATED MOVIES!!!!!!! THIS ONE'S TITLED 'DEEP NOSTRIL'.\nTHE PIMP LIKES THIS ONE!!!!!!\nHE'S ENGROSSED IN THE ACTION HE SEES!!!! SEEMS DISTRACTED.................`,
                `IT'S HAPPY DAZE!!!!!!!!\nRICHIE TURNS TO GONZY AND SAYS 'BUT YOU ALWAYS HAD IT MADE WITH THE GIRLS.......WHAT'S YOUR SECRET???'\nTHE GONZ SAYS 'AAYYYYYY....I DIDN'T GET MY NAME FOR NUTHIN!'\nREACHING INTO HIS POCKET HE PULLS OUT A FUNNY LOOKING CIGARETTE............`,
                `MRS. SMITH AND MRS. JONES ARE COMPARING\nDETERGENTS.......SEE THIS BLOUSE? WE'RE MAKING IT THIS DIRTY TO SEE WHO'S WORKS BETTER.(A DOG IS THROWN ONTO THE BLOUSE. IN HIS EXCITEMENT HE DEFICATES ALL OVER IT......)\nDO YOU THINK YOURS WILL WORK- MRS. SMITH?? (THE CAMERA PANS TO MRS. SMITH. SHE THROWS UP.)\nMRS JONES????? (A SHOT SHOWS HER TAKING THE DOG AND...........)`
            ];
            
            const randomChannel = channels[Math.floor(Math.random() * channels.length)];
            this.addToGameDisplay(`<div class="message" style="white-space: pre-line;">${randomChannel}</div>`);
        } catch (error) {
            console.error("Error in tvOnLook:", error);
            this.addToGameDisplay(`<div class="message">THE TV SEEMS TO BE MALFUNCTIONING.</div>`);
        }
    }
    
    // Look at girl
    girlLook() {
        try {
            if (this.girlPoints > 3) {
                this.addToGameDisplay(`<div class="message">SHE SLAPS ME AND YELLS 'PERVERT!!!!!!'</div>`);
            } else {
                this.addToGameDisplay(`<div class="message">${this.specialTexts[4]}</div>`);
            }
        } catch (error) {
            console.error("Error in girlLook:", error);
            this.addToGameDisplay(`<div class="message">SHE LOOKS AWAY.</div>`);
        }
    }
    
    // Look at girl in jacuzzi
    girlLookRoom26() {
        try {
            this.addToGameDisplay(`<div class="message">${this.specialTexts[5]}</div>`);
        } catch (error) {
            console.error("Error in girlLookRoom26:", error);
            this.addToGameDisplay(`<div class="message">SHE LOOKS RELAXED IN THE JACUZZI.</div>`);
        }
    }
    
    // Look at rubber
    lookRubber() {
        try {
            const color = this.rubberColor || "GENERIC";
            const flavor = this.rubberFlavor || "UNFLAVORED";
            const lubricated = this.rubberLubricated ? "LUBRICATED" : "NON-LUBRICATED";
            const ribbed = this.rubberRibbed ? "RIBBED" : "SMOOTH";
            
            if (!this.rubberColor) {
                this.addToGameDisplay(`<div class="message">IT'S A RUBBER.</div>`);
            } else {
                this.addToGameDisplay(`<div class="message">IT'S ${color}, ${flavor}-FLAVORED, ${lubricated}, AND ${ribbed}</div>`);
            }
        } catch (error) {
            console.error("Error in lookRubber:", error);
            this.addToGameDisplay(`<div class="message">IT'S A RUBBER.</div>`);
        }
    }
    
    // Show graffiti
    showGraffiti() {
        try {
            let output = `<div class="message" style="white-space: pre-line;">
            ****************************************************
            AT MY APPLE IS WHERE I SIT,
            WHEN I FEEL LIKE FONDLING IT'S BITS!
            
            COMPUTER FREAKS PEEK BEFORE THEY POKE
            I'D LIKE TO NIBBLE HER FLOPPIES!
            
            ASCII, AND YE SHALL RECEIVE
            
            THE PASSWORD IS:
            BELLYBUTTON
            ****************************************************</div>`;
            
            this.addToGameDisplay(output);
        } catch (error) {
            console.error("Error in showGraffiti:", error);
            this.addToGameDisplay(`<div class="message">THE GRAFFITI IS ILLEGIBLE.</div>`);
        }
    }
    
    // Look at billboard
    lookBillboard() {
        try {
            let output = `<div class="message" style="white-space: pre-line;">
            ****************************************************
            FOR THOSE WHO DESIRE THE BEST:
            
            ANNOUNCING
            
            THE MOST EXCLUSIVE,
            
            THE EXCITING,
            
            THE HOTTEST SPOT IN TOWN,
            
            SWINGING SINGLE'S DISCO
            ****************************************************</div>`;
            
            this.addToGameDisplay(output);
        } catch (error) {
            console.error("Error in lookBillboard:", error);
            this.addToGameDisplay(`<div class="message">THE BILLBOARD HAS AN AD FOR A DISCO.</div>`);
        }
    }
    
    // Read newspaper
    readNewspaper() {
        try {
            let output = `<div class="message" style="white-space: pre-line;">THE NEWS!!!
            TODAY THE PRIME RATE WAS RAISED ONCE AGAIN...TO 257%! THIS DOES NOT COME NEAR THE RECORD SET IN 1996- WHEN IT BROKE 
            THE 1000% MARK.........................
            THE BIRTH RATE HAS TAKEN A DRAMATIC FALL....THIS IS DUE TO THE INCREASED USAGE OF COMPUTERS AS SEXUAL PARTNERS..
            HOWEVER....RAPES OF INNOCENT PEOPLE ARE ON THE INCREASE! AND WHO IS THE RAPIST?? COMPUTERIZED BANKING MACHINES LEAD THE LIST....FOLLOWED BY HOME COMPUTERS.....</div>`;
            
            this.addToGameDisplay(output);
        } catch (error) {
            console.error("Error in readNewspaper:", error);
            this.addToGameDisplay(`<div class="message">THE NEWSPAPER HAS SOME ECONOMIC NEWS.</div>`);
        }
    }
    
    // Read magazine
    readMagazine() {
        try {
            let output = `<div class="message" style="white-space: pre-line;">HMMMMM..... AN INTERESTING MAGAZINE WITH A NICE CENTERFOLD!
            THE FEATURE ARTICLE IS ABOUT HOW TO PICK UP AN INNOCENT GIRL AT A DISCO.
            IT SAYS- 'SHOWER HER WITH PRESENTS. DANCING WON'T HURT EITHER.
            AND WINE IS ALWAYS GOOD TO GET THINGS MOVING!'</div>`;
            
            this.addToGameDisplay(output);
        } catch (error) {
            console.error("Error in readMagazine:", error);
            this.addToGameDisplay(`<div class="message">THE MAGAZINE HAS DATING ADVICE.</div>`);
        }
    }
    
    // Look at hooker
    hookerLook() {
        try {
            this.addToGameDisplay(`<div class="message">${this.specialTexts[1]}</div>`);
        } catch (error) {
            console.error("Error in hookerLook:", error);
            this.addToGameDisplay(`<div class="message">SHE LOOKS IMPATIENT.</div>`);
        }
    }
    
    // Look at blonde
    blondeLook() {
        try {
            this.addToGameDisplay(`<div class="message">${this.specialTexts[10]}</div>`);
        } catch (error) {
            console.error("Error in blondeLook:", error);
            this.addToGameDisplay(`<div class="message">THE BLONDE LOOKS ATTRACTIVE.</div>`);
        }
    }
    
    // Look through peephole
    peepholeLook() {
        try {
            let output = `<div class="message" style="white-space: pre-line;">HMMMM..... THIS IS A PEEPING TOMS PARADISE!!!!
            ACROSS THE WAY IS ANOTHER HOTEL. AHAH! THE CURTAINS ARE OPEN AT ONE WINDOW!
            THE BATHROOM DOOR OPENS AND A GIRL WALKS OUT. HOLY COW! HER BOOBS ARE HUGE- AND LOOK AT THE WAY THEY SWAY AS SHE STRIDES ACROSS THE ROOM!
            NOW SHE'S TAKING A LARGE SAUSAGE SHAPED OBJECT AND LOOKING AT IT LONGINGLY! DAMN! SHE SHUTS THE CURTAIN!</div>`;
            
            this.addToGameDisplay(output);
        } catch (error) {
            console.error("Error in peepholeLook:", error);
            this.addToGameDisplay(`<div class="message">I CAN SEE INTO ANOTHER ROOM.</div>`);
        }
    }
    
    // Add an item to the current room
    addToRoom(itemId) {
        try {
            if (!this.isObjectInRoom(itemId)) {
                if (!this.roomObjects[this.currentRoom]) {
                    this.roomObjects[this.currentRoom] = [];
                }
                this.roomObjects[this.currentRoom].push(itemId);
            }
        } catch (error) {
            console.error("Error adding to room:", error);
        }
    }
    
    // Check if an object is in the current room
    isObjectInRoom(objectId) {
        try {
            return this.roomObjects[this.currentRoom] && this.roomObjects[this.currentRoom].includes(objectId);
        } catch (error) {
            console.error("Error checking if object is in room:", error);
            return false;
        }
    }
    
    // Check if an object is in inventory
    isObjectInInventory(objectId) {
        try {
            return this.inventory.includes(objectId);
        } catch (error) {
            console.error("Error checking if object is in inventory:", error);
            return false;
        }
    }
    
    // Get object ID from noun
    getObjectId(noun) {
        try {
            if (!noun) return null;
            
            noun = noun.toUpperCase();
            
            // Simple matching by the first 4 characters
            const nounPrefix = noun.length >= 4 ? noun.substring(0, 4) : noun;
            
            for (const [objId, name] of Object.entries(this.objectNames)) {
                if (name.toUpperCase().includes(nounPrefix)) {
                    return parseInt(objId);
                }
            }
            
            return null;
        } catch (error) {
            console.error("Error getting object ID:", error);
            return null;
        }
    }
    
    // Show inventory
    showInventory() {
        try {
            if (this.inventory.length === 0) {
                this.addToGameDisplay(`<div class="message">I'M CARRYING NOTHING!!</div>`);
                return;
            }
            
            let items = this.inventory.map(itemId => this.getItemName(itemId)).join(", ");
            this.addToGameDisplay(`<div class="message">I'M CARRYING THE FOLLOWING: ${items}</div>`);
        } catch (error) {
            console.error("Error showing inventory:", error);
            this.addToGameDisplay(`<div class="message">ERROR VIEWING INVENTORY.</div>`);
        }
    }
    
    // Look at an object
    lookAt(noun) {
        try {
            if (!noun) {
                this.displayRoom();
                return;
            }
            
            // Convert noun to object ID
            const objectId = this.getObjectId(noun);
            
            if (!objectId) {
                this.addToGameDisplay(`<div class="message">I DON'T SEE THAT HERE!!</div>`);
                return;
            }
            
            // Check if the object is in the room or inventory
            if (!this.isObjectInRoom(objectId) && !this.isObjectInInventory(objectId)) {
                this.addToGameDisplay(`<div class="message">IT'S NOT HERE!!!!!</div>`);
                return;
            }
            
            // Special handling for objects
            switch (objectId) {
                case 8: // Desk
                    if (this.drawerOpened === 1 && this.drawerExamined === 0) {
                        this.addToGameDisplay(`<div class="message">I SEE SOMETHING!!</div>`);
                        this.drawerExamined = 2;
                        this.addToRoom(50); // Add newspaper
                    } else if (this.drawerOpened === 0) {
                        this.addToGameDisplay(`<div class="message">IT'S DRAWER IS SHUT</div>`);
                    } else {
                        this.addToGameDisplay(`<div class="message">JUST AN ORDINARY DESK</div>`);
                    }
                    break;
                    
                case 9: // Washbasin
                    if (this.toiletExamined === 0) {
                        this.addToGameDisplay(`<div class="message">I SEE SOMETHING!!</div>`);
                        this.toiletExamined = 1;
                        this.addToRoom(51); // Add wedding ring
                    } else {
                        this.addToGameDisplay(`<div class="message">DEAD COCKROACHES....</div>`);
                    }
                    break;
                    
                case 10: // Graffiti
                    this.showGraffiti();
                    break;
                    
                case 11: // Mirror
                    this.addToGameDisplay(`<div class="message">THERE'S A PERVERT LOOKING BACK AT ME!!!</div>`);
                    break;
                    
                case 12: // Toilet
                    this.addToGameDisplay(`<div class="message">HASN'T BEEN FLUSHED IN AGES! STINKS!!!!</div>`);
                    break;
                    
                case 17: // Hooker
                    this.hookerLook();
                    break;
                    
                case 18: // Billboard
                    this.lookBillboard();
                    break;
                    
                case 20: // TV
                    if (this.tvOn === 0) {
                        this.addToGameDisplay(`<div class="message">ONLY IF YOU TURN IT ON! SAY 'TV ON'</div>`);
                    } else {
                        this.tvOnLook();
                    }
                    break;
                    
                case 24: // Ashtray
                    if (this.ashtreyExamined === 0) {
                        this.addToGameDisplay(`<div class="message">I SEE SOMETHING!!</div>`);
                        this.ashtreyExamined = 1;
                        this.addToRoom(64); // Add passcard
                    } else {
                        this.addToGameDisplay(`<div class="message">JUST CIGARETTE BUTTS</div>`);
                    }
                    break;
                    
                case 25: // Blonde
                    this.blondeLook();
                    break;
                    
                case 27: // Bum
                    this.addToGameDisplay(`<div class="message">HE GRUMBLES- I'LL TELL YOU A STORY FOR A BOTTLE OF WINE.....</div>`);
                    break;
                    
                case 28: // Peephole
                    this.peepholeLook();
                    break;
                    
                case 29: // Display rack
                    if (this.magazineFound === 0) {
                        this.addToGameDisplay(`<div class="message">I SEE SOMETHING!!</div>`);
                        this.magazineFound = 1;
                        this.addToRoom(68); // Add magazine
                    } else {
                        this.addToGameDisplay(`<div class="message">JUST A DISPLAY RACK</div>`);
                    }
                    break;
                    
                case 30: // Door
                    if (this.currentRoom === 23) {
                        if (this.doorUnlocked === 0) {
                            this.addToGameDisplay(`<div class="message">A SIGN SAYS 'ENTRY BY SHOWING PASSCARD- CLUB MEMBERS AND THEIR GUESTS ONLY!</div>`);
                        } else {
                            this.addToGameDisplay(`<div class="message">IT'S UNLOCKED</div>`);
                        }
                    } else {
                        this.addToGameDisplay(`<div class="message">IT'S A DOOR</div>`);
                    }
                    break;
                    
                case 34: // Telephone
                    if (this.currentRoom === 20) {
                        this.addToGameDisplay(`<div class="message">A NUMBER IS THERE- 'CALL 555-6969 FOR A GOOD TIME!'</div>`);
                    } else {
                        this.addToGameDisplay(`<div class="message">IT LOOKS LIKE A TELEPHONE</div>`);
                    }
                    break;
                    
                case 35: // Closet
                    if (this.closetOpened === 0) {
                        this.addToGameDisplay(`<div class="message">IT'S CLOSED</div>`);
                    } else {
                        if (this.closetOpened === 1) {
                            this.addToGameDisplay(`<div class="message">I SEE SOMETHING!!</div>`);
                            this.closetOpened = 2;
                            this.addToRoom(74); // Add doll
                        } else {
                            this.addToGameDisplay(`<div class="message">IT'S OPEN</div>`);
                        }
                    }
                    break;
                    
                case 42: // Cabinet
                    if (this.stoolUsed === 0) {
                        this.addToGameDisplay(`<div class="message">IT'S TOO HIGH!</div>`);
                    } else if (this.cabinetOpened === 1) {
                        this.addToGameDisplay(`<div class="message">I SEE SOMETHING!!</div>`);
                        this.cabinetOpened = 2;
                        this.addToRoom(76); // Add pitcher
                    } else if (this.cabinetOpened >= 2) {
                        this.addToGameDisplay(`<div class="message">IT'S EMPTY NOW</div>`);
                    }
                    break;
                    
                case 45: // Tree
                    this.addToGameDisplay(`<div class="message">I SEE SOMETHING!!</div>`);
                    this.addToRoom(75); // Add apple
                    break;
                    
                case 47: // Plant
                    if (!this.bushesFound) {
                        this.addToGameDisplay(`<div class="message">THERE'S A GROUP OF BUSHES BEHIND IT!!</div>`);
                        this.bushesFound = 1;
                        this.addToRoom(44); // Add bushes
                    } else {
                        this.addToGameDisplay(`<div class="message">IT'S A NICE PLANT.</div>`);
                    }
                    break;
                    
                case 49: // Girl
                    if (this.currentRoom === 26) {
                        this.girlLookRoom26();
                    } else {
                        this.girlLook();
                    }
                    break;
                    
                case 50: // Newspaper
                    this.readNewspaper();
                    break;
                    
                case 56: // Garbage
                    if (this.dumpsterChecked === 0) {
                        this.addToGameDisplay(`<div class="message">I SEE SOMETHING!!</div>`);
                        this.dumpsterChecked = 1;
                        this.addToRoom(58); // Add apple core
                    } else {
                        this.addToGameDisplay(`<div class="message">JUST TRASH</div>`);
                    }
                    break;
                    
                case 58: // Apple core
                    if (this.appleCore === 0) {
                        this.addToGameDisplay(`<div class="message">I SEE SOMETHING!!</div>`);
                        this.appleCore = 1;
                        this.addToRoom(59); // Add seeds
                    } else {
                        this.addToGameDisplay(`<div class="message">JUST A CORE</div>`);
                    }
                    break;
                    
                case 61: // Pills
                    this.addToGameDisplay(`<div class="message">THE LABEL ON THE BOTTLE SAYS 'WANT TO DRIVE SOMEONE CRAZY WITH LUST?? TRY THIS!!!!</div>`);
                    break;
                    
                case 68: // Magazine
                    this.readMagazine();
                    break;
                    
                case 69: // Rubber
                    this.lookRubber();
                    break;
                    
                case 73: // Wallet
                    this.addToGameDisplay(`<div class="message">IT CONTAINS $${this.money}00</div>`);
                    break;
                    
                case 74: // Inflatable doll
                    if (this.idInflated === 1) {
                        this.addToGameDisplay(`<div class="message">IT'S INFLATED</div>`);
                    } else {
                        this.addToGameDisplay(`<div class="message">IT'S ROLLED UP IN A LITTLE BALL!</div>`);
                    }
                    break;
                    
                case 76: // Pitcher
                    if (this.pitcherFull === 0) {
                        this.addToGameDisplay(`<div class="message">IT'S EMPTY</div>`);
                    } else {
                        this.addToGameDisplay(`<div class="message">IT'S FULL</div>`);
                    }
                    break;
                    
                default:
                    this.addToGameDisplay(`<div class="message">I SEE NOTHING SPECIAL</div>`);
            }
            
            // Update UI after examining objects (may reveal new items)
            this.updateUI();
        } catch (error) {
            console.error("Error looking at object:", error);
            this.addToGameDisplay(`<div class="message">ERROR EXAMINING OBJECT.</div>`);
        }
    }
    
    // Move to a new room
    moveTo(direction) {
        try {
            if (this.tiedToBed) {
                this.addToGameDisplay(`<div class="message">BUT I'M TIED TO THE BED!!!!!</div>`);
                return;
            }
            
            if (!direction) {
                this.addToGameDisplay(`<div class="message">WHICH DIRECTION?</div>`);
                return;
            }
            
            // Get available directions for the current room
            const availableDirs = this.getAvailableDirections();
            
            // Check if the direction is valid
            if (!availableDirs.includes(direction)) {
                this.addToGameDisplay(`<div class="message">I CAN'T GO IN THAT DIRECTION!!</div>`);
                return;
            }
            
            // Special case for room 9
            if (this.currentRoom === 9 && this.score === 0) {
                this.addToGameDisplay(`<div class="message">THE HOOKER SAYS 'DON'T GO THERE....DO ME FIRST!!!!'</div>`);
                return;
            }
            
            // Special case for room 17 (locked door)
            if (this.currentRoom === 17 && direction === "SOUTH" && this.girlPoints < 5) {
                this.addToGameDisplay(`<div class="message">THE DOOR IS LOCKED SHUT!</div>`);
                return;
            }
            
            // Special case for room 23 (disco door)
            if (this.currentRoom === 23 && direction === "WEST" && this.doorUnlocked === 0) {
                this.addToGameDisplay(`<div class="message">THE DOOR IS CLOSED!</div>`);
                return;
            }
            
            // Special case for room 5 (pimp room)
            if (this.currentRoom === 5 && direction === "UP") {
                if (this.score === 0) {
                    if (this.money < 10) {
                        this.addToGameDisplay(`<div class="message">THE PIMP SAYS I CAN'T UNTIL I GET $1000</div>`);
                        return;
                    }
                    this.money -= 10;
                    this.addToGameDisplay(`<div class="message">THE PIMP TAKES $1000 AND SAYS OK</div>`);
                } else {
                    if (this.blondeGirlDrugged === 0) {
                        this.addToGameDisplay(`<div class="message">THE PIMP SAYS 'NO WAY!!!! LEAVE MY GIRL ALONE!</div>`);
                        return;
                    }
                }
            }
            
            // Calculate the new room
            let newRoom = this.currentRoom;
            if (direction === "NORTH") {
                newRoom += 1;
            } else if (direction === "SOUTH") {
                newRoom -= 1;
            } else if (direction === "EAST") {
                newRoom += 2;
            } else if (direction === "WEST") {
                newRoom -= 2;
            } else if (direction === "UP") {
                newRoom += 4;
            } else if (direction === "DOWN") {
                newRoom -= 4;
            }
            
            // Special case for room 10 and using rope
            if (this.currentRoom === 10 && direction === "WEST") {
                if (this.usingRope !== 1) {
                    this.addToGameDisplay(`<div class="message">AAAAAEEEEEIIIIIIII!!!!!!!!!</div>`);
                    this.addToGameDisplay(`<div class="message">SPLAAATTTTT!!!!!</div>`);
                    this.addToGameDisplay(`<div class="message">I SHOULD HAVE USED SAFETY ROPE!!!!!!!!</div>`);
                    this.gameOver();
                    return;
                }
            }
            
            // Update the current room
            this.currentRoom = newRoom;
            
            // Turn off using_rope if going down from a balcony
            if (direction === "DOWN" && this.usingRope === 1) {
                this.usingRope = 0;
            }
            
            // Display the new room
            this.displayRoom();
        } catch (error) {
            console.error("Error moving to new room:", error);
            this.addToGameDisplay(`<div class="message">ERROR MOVING.</div>`);
        }
    }
    
    // Talk to a character (simplified for this implementation)
    talkTo(noun) {
        try {
            // Convert noun to object ID
            const objectId = this.getObjectId(noun);
            
            if (!objectId) {
                this.addToGameDisplay(`<div class="message">WHO SHOULD I TALK TO?</div>`);
                return;
            }
            
            // Check if the object is in the room
            if (!this.isObjectInRoom(objectId)) {
                this.addToGameDisplay(`<div class="message">THEY'RE NOT HERE!</div>`);
                return;
            }
            
            // Check if it's a character
            const types = this.objectTypes[objectId] || [];
            if (!types.includes("CHARACTER")) {
                this.addToGameDisplay(`<div class="message">I CAN'T TALK TO THAT!</div>`);
                return;
            }
            
            // Handle specific characters
            switch(objectId) {
                case 15: // Bartender
                    this.addToGameDisplay(`<div class="message">THE BARTENDER SAYS 'WHAT'LL IT BE?'</div>`);
                    break;
                case 16: // Pimp
                    this.addToGameDisplay(`<div class="message">THE PIMP GLARES AT ME AND SAYS 'GIMME $1000 IF YOU WANT MY GIRL!'</div>`);
                    break;
                case 17: // Hooker
                    this.addToGameDisplay(`<div class="message">THE HOOKER WINKS AT ME AND SAYS 'READY FOR SOME FUN, HONEY?'</div>`);
                    break;
                case 19: // Preacher
                    this.addToGameDisplay(`<div class="message">THE PREACHER SAYS 'LOOKING TO GET HITCHED?'</div>`);
                    break;
                case 25: // Blonde
                    this.addToGameDisplay(`<div class="message">THE BLONDE GIVES ME A SEDUCTIVE SMILE.</div>`);
                    break;
                case 27: // Bum
                    this.addToGameDisplay(`<div class="message">THE BUM MUMBLES SOMETHING ABOUT WINE.</div>`);
                    break;
                case 32: // Waitress
                    this.addToGameDisplay(`<div class="message">THE WAITRESS ASKS 'WHAT CAN I GET YOU?'</div>`);
                    break;
                case 41: // Dealer
                    this.addToGameDisplay(`<div class="message">THE DEALER SAYS 'PLACE YOUR BETS!'</div>`);
                    break;
                case 49: // Girl
                    this.addToGameDisplay(`<div class="message">THE GIRL SMILES SHYLY.</div>`);
                    break;
                default:
                    this.addToGameDisplay(`<div class="message">THEY DON'T SEEM INTERESTED IN CONVERSATION.</div>`);
            }
        } catch (error) {
            console.error("Error talking to character:", error);
            this.addToGameDisplay(`<div class="message">ERROR DURING CONVERSATION.</div>`);
        }
    }
    
    // Open an object (previously unimplemented)
    openObject(noun) {
        try {
            // Convert noun to object ID
            const objectId = this.getObjectId(noun);
            
            if (!objectId) {
                this.addToGameDisplay(`<div class="message">OPEN WHAT?</div>`);
                return;
            }
            
            // Check if the object is in the room
            if (!this.isObjectInRoom(objectId) && !this.isObjectInInventory(objectId)) {
                this.addToGameDisplay(`<div class="message">I DON'T SEE THAT HERE!</div>`);
                return;
            }
            
            // Handle specific openable objects
            switch(objectId) {
                case 8: // Desk
                    if (this.currentRoom === 1) {
                        if (this.drawerOpened === 0) {
                            this.addToGameDisplay(`<div class="message">OK</div>`);
                            this.drawerOpened = 1;
                        } else {
                            this.addToGameDisplay(`<div class="message">IT'S ALREADY OPEN</div>`);
                        }
                    } else {
                        this.addToGameDisplay(`<div class="message">NOT POSSIBLE RIGHT NOW</div>`);
                    }
                    break;
                
                case 30: // Door
                    if (this.currentRoom === 23) {
                        // The door to the disco
                        // Check if player has the passcard
                        if (this.isObjectInInventory(64)) {
                            this.addToGameDisplay(`<div class="message">A VOICE ASKS 'PASSCARD??' I SEARCH IN MY POCKETS AND I HAVE IT! THE DOOR OPENS!</div>`);
                            this.doorUnlocked = 1;
                            // Update the room exits to include WEST
                            if (this.roomExits[23] && this.roomExits[23][1]) {
                                if (!this.roomExits[23][1].includes("WEST")) {
                                    this.roomExits[23][1].push("WEST");
                                }
                            }
                        } else {
                            this.addToGameDisplay(`<div class="message">A VOICE ASKS 'PASSCARD??' I DON'T HAVE ONE.</div>`);
                        }
                    } else {
                        this.addToGameDisplay(`<div class="message">IT WON'T OPEN</div>`);
                    }
                    break;
                
                case 35: // Closet
                    if (this.currentRoom === 29) {
                        if (this.closetOpened === 0) {
                            this.addToGameDisplay(`<div class="message">OK</div>`);
                            this.closetOpened = 1;
                        } else {
                            this.addToGameDisplay(`<div class="message">IT'S ALREADY OPEN</div>`);
                        }
                    } else {
                        this.addToGameDisplay(`<div class="message">NOT POSSIBLE RIGHT NOW</div>`);
                    }
                    break;
                
                case 42: // Cabinet
                    if (this.currentRoom === 27) {
                        if (this.stoolUsed === 0) {
                            this.addToGameDisplay(`<div class="message">IT'S TOO HIGH TO REACH!</div>`);
                        } else if (this.cabinetOpened === 0) {
                            this.addToGameDisplay(`<div class="message">OK</div>`);
                            this.cabinetOpened = 1;
                        } else {
                            this.addToGameDisplay(`<div class="message">IT'S ALREADY OPEN</div>`);
                        }
                    } else {
                        this.addToGameDisplay(`<div class="message">NOT POSSIBLE RIGHT NOW</div>`);
                    }
                    break;
                
                default:
                    this.addToGameDisplay(`<div class="message">I CAN'T OPEN THAT</div>`);
            }
            
            // Update UI after opening objects (may reveal new items)
            this.updateUI();
        } catch (error) {
            console.error("Error opening object:", error);
            this.addToGameDisplay(`<div class="message">ERROR OPENING OBJECT.</div>`);
        }
    }
    
    // Buy an object (previously unimplemented)
    buyObject(noun) {
        try {
            // Convert noun to object ID
            const objectId = this.getObjectId(noun);
            
            if (!objectId) {
                this.addToGameDisplay(`<div class="message">BUY WHAT?</div>`);
                return;
            }
            
            // Check if we have enough money
            if (this.money < 1) {
                this.addToGameDisplay(`<div class="message">NO MONEY!!!</div>`);
                return;
            }
            
            // Handle buying at different locations
            if (this.currentRoom === 3) { // At the bar
                if (objectId === 52 && !this.whiskeybought) { // Whiskey
                    this.money -= 1;
                    this.whiskeybought = true;
                    this.addToGameDisplay(`<div class="message">I GIVE THE BARTENDER $100 AND HE PLACES IT ON THE BAR.</div>`);
                    this.addToGameDisplay(`<div class="message">I TAKE THE WHISKEY</div>`);
                    this.inventory.push(52);
                } else if (objectId === 53 && !this.beerBought) { // Beer
                    this.money -= 1;
                    this.beerBought = true;
                    this.addToGameDisplay(`<div class="message">I GIVE THE BARTENDER $100 AND HE PLACES IT ON THE BAR.</div>`);
                    this.addToGameDisplay(`<div class="message">I TAKE THE BEER</div>`);
                    this.inventory.push(53);
                } else {
                    this.addToGameDisplay(`<div class="message">SORRY...TEMPORARILY SOLD OUT</div>`);
                }
            } else if (this.currentRoom === 21) { // At the disco
                if (objectId === 72) { // Wine
                    if (this.wineBottle === 0) {
                        this.money -= 1;
                        this.wineBottle = 1;
                        this.addToGameDisplay(`<div class="message">THE WAITRESS TAKES $100 AND SAYS SHE'LL RETURN</div>`);
                        setTimeout(() => {
                            this.addToGameDisplay(`<div class="message">POOR SERVICE!</div>`);
                            setTimeout(() => {
                                this.addToGameDisplay(`<div class="message">SHE RETURNS WITH A BOTTLE OF WINE</div>`);
                                this.inventory.push(72);
                                this.updateUI();
                            }, 2000);
                        }, 3000);
                    } else {
                        this.addToGameDisplay(`<div class="message">SORRY....ALL OUT!</div>`);
                    }
                } else {
                    this.addToGameDisplay(`<div class="message">THEY DON'T SELL THAT HERE</div>`);
                }
            } else if (this.currentRoom === 24) { // At the pharmacy
                if (objectId === 69) { // Rubber
                    this.money -= 1;
                    // Interactive rubber selection
                    this.addToGameDisplay(`<div class="message">THE MAN LEANS OVER THE COUNTER AND WHISPERS:</div>`);
                    this.addToGameDisplay(`<div class="system-message">
                        WHAT COLOR?
                        <button id="rubber-red">RED</button>
                        <button id="rubber-blue">BLUE</button>
                        <button id="rubber-green">GREEN</button>
                    </div>`);
                    
                    // We'll handle the rest of the selection in the UI handler
                    this.selectingRubber = true;
                    
                } else if (objectId === 68) { // Magazine
                    this.money -= 1;
                    this.addToGameDisplay(`<div class="message">HE TAKES $100 AND GIVES ME THE MAGAZINE</div>`);
                    this.inventory.push(68);
                } else {
                    this.addToGameDisplay(`<div class="message">THEY DON'T SELL THAT HERE</div>`);
                }
            } else {
                this.addToGameDisplay(`<div class="message">I CAN'T BUY ANYTHING HERE</div>`);
            }
            
            // Update UI
            this.updateUI();
        } catch (error) {
            console.error("Error buying object:", error);
            this.addToGameDisplay(`<div class="message">ERROR BUYING OBJECT.</div>`);
        }
    }
    
    // Complete rubber purchase process
    completeRubberPurchase(color, flavor, lubricated, ribbed) {
        try {
            this.rubberColor = color;
            this.rubberFlavor = flavor;
            this.rubberLubricated = lubricated;
            this.rubberRibbed = ribbed;
            
            this.addToGameDisplay(`<div class="message">HE YELLS- THIS PERVERT JUST BOUGHT A ${color}, ${flavor}-FLAVORED ${lubricated ? "LUBRICATED" : "NON-LUBRICATED"}, ${ribbed ? "RIBBED" : "SMOOTH"} RUBBER!!!!</div>`);
            this.addToGameDisplay(`<div class="message">A LADY WALKS BY AND LOOKS AT ME IN DISGUST!!!!</div>`);
            
            this.inventory.push(69);
            this.updateUI();
        } catch (error) {
            console.error("Error completing rubber purchase:", error);
            this.addToGameDisplay(`<div class="message">ERROR COMPLETING PURCHASE.</div>`);
        }
    }
    
    // Use/wear an object (previously unimplemented)
    useObject(noun) {
        try {
            // Convert noun to object ID
            const objectId = this.getObjectId(noun);
            
            if (!objectId) {
                this.addToGameDisplay(`<div class="message">USE WHAT?</div>`);
                return;
            }
            
            // Check if the object is in inventory
            if (!this.isObjectInInventory(objectId)) {
                this.addToGameDisplay(`<div class="message">I DON'T HAVE THAT</div>`);
                return;
            }
            
            // Handle specific usable objects
            switch(objectId) {
                case 69: // Rubber
                    if (this.wearingRubber === 0) {
                        this.addToGameDisplay(`<div class="message">OK, I PUT IT ON</div>`);
                        this.wearingRubber = 1;
                    } else {
                        this.addToGameDisplay(`<div class="message">I'M ALREADY WEARING IT</div>`);
                    }
                    break;
                
                case 81: // Rope
                    if (this.currentRoom === 7 || this.currentRoom === 10) {
                        if (this.usingRope === 0) {
                            this.usingRope = 1;
                            this.addToGameDisplay(`<div class="message">OK</div>`);
                        } else {
                            this.addToGameDisplay(`<div class="message">I'M ALREADY USING IT</div>`);
                        }
                    } else {
                        this.addToGameDisplay(`<div class="message">NO POINT USING THAT HERE</div>`);
                    }
                    break;
                
                case 74: // Inflatable doll
                    if (this.idInflated === 0) {
                        this.addToGameDisplay(`<div class="message">I NEED TO INFLATE IT FIRST</div>`);
                    } else if (this.idInflated === 1) {
                        this.addToGameDisplay(`<div class="message">OH BOY!!!!!- IT'S GOT 3 SPOTS TO TRY!!!</div>`);
                        this.addToGameDisplay(`<div class="message">I THRUST INTO THE DOLL- KINKY....EH???</div>`);
                        this.addToGameDisplay(`<div class="message">I START TO INCREASE MY TEMPO...FASTER AND FASTER I GO!!!!</div>`);
                        this.addToGameDisplay(`<div class="message">SUDDENLY THERE'S A FLATULENT NOISE AND THE DOLL BECOMES A POPPED BALLOON SOARING AROUND THE ROOM! IT FLIES OUT OF THE ROOM AND DISAPPEARS!</div>`);
                        this.removeFromInventory(74);
                        this.idInflated = 2; // Popped
                    } else {
                        this.addToGameDisplay(`<div class="message">THE DOLL IS GONE</div>`);
                    }
                    break;
                
                case 76: // Pitcher
                    if (this.pitcherFull === 1) {
                        if (this.currentRoom === 28 && this.isObjectInRoom(59)) { // Seeds in garden
                            this.pitcherFull = 0;
                            this.addToGameDisplay(`<div class="message">A TREE SPROUTS!!</div>`);
                            this.removeFromRoom(28, 59); // Remove seeds
                            if (!this.isObjectInRoom(45)) { // Add tree if not present
                                this.addToRoom(45);
                            }
                        } else {
                            this.addToGameDisplay(`<div class="message">IT POURS INTO THE GROUND</div>`);
                            this.pitcherFull = 0;
                        }
                    } else {
                        this.addToGameDisplay(`<div class="message">THE PITCHER IS EMPTY</div>`);
                    }
                    break;
                
                case 66: // Knife
                    if (this.tiedToBed === 1) {
                        this.addToGameDisplay(`<div class="message">I DO AND IT WORKED! THANKS!</div>`);
                        this.tiedToBed = 0;
                    } else {
                        this.addToGameDisplay(`<div class="message">I DON'T WANT TO!</div>`);
                    }
                    break;
                
                case 84: // Remote control
                    if (this.isObjectInRoom(20)) { // If there's a TV in the room
                        this.addToGameDisplay(`<div class="system-message">
                            WHAT DO YOU WANT TO DO?
                            <button id="tv-on">TURN ON TV</button>
                            <button id="tv-off">TURN OFF TV</button>
                        </div>`);
                    } else {
                        this.addToGameDisplay(`<div class="message">NO TV HERE!</div>`);
                    }
                    break;
                
                default:
                    this.addToGameDisplay(`<div class="message">I CAN'T USE THAT</div>`);
            }
            
            // Update UI
            this.updateUI();
        } catch (error) {
            console.error("Error using object:", error);
            this.addToGameDisplay(`<div class="message">ERROR USING OBJECT.</div>`);
        }
    }
    
    // TV power control
    tvPower(state) {
        try {
            // Check if there's a TV in the room
            if (!this.isObjectInRoom(20)) {
                this.addToGameDisplay(`<div class="message">THERE'S NO TV HERE</div>`);
                return;
            }
            
            if (state === "ON") {
                // Special case for room 5 - the pimp gets distracted
                if (this.currentRoom === 5) {
                    this.tvOn = 1;
                    this.addToGameDisplay(`<div class="message">THE TV IS NOW ON</div>`);
                    this.tvOnLook();
                    if (this.score === 0) {
                        this.addToGameDisplay(`<div class="message">THE PIMP IS DISTRACTED BY THE TV</div>`);
                        // Makes it easier to go upstairs
                        this.blondeGirlDrugged = 1;
                    }
                } else {
                    this.tvOn = 1;
                    this.addToGameDisplay(`<div class="message">THE TV IS NOW ON</div>`);
                    this.tvOnLook();
                }
            } else {
                this.tvOn = 0;
                this.addToGameDisplay(`<div class="message">THE TV IS NOW OFF</div>`);
            }
        } catch (error) {
            console.error("Error controlling TV:", error);
            this.addToGameDisplay(`<div class="message">ERROR CONTROLLING TV.</div>`);
        }
    }
    
    // Play slots mini-game
    playSlots() {
        try {
            // Check if we're in the casino
            if (this.currentRoom !== 13) {
                this.addToGameDisplay(`<div class="message">THERE ARE NO SLOT MACHINES HERE</div>`);
                return;
            }
            
            // Check if we have money
            if (this.money < 1) {
                this.addToGameDisplay(`<div class="message">I'M BROKE!!!</div>`);
                return;
            }
            
            this.addToGameDisplay(`<div class="message">THIS WILL COST $100 EACH TIME</div>`);
            this.addToGameDisplay(`<div class="message">YOU HAVE $${this.money}00</div>`);
            
            this.addToGameDisplay(`<div class="system-message">
                WOULD YOU LIKE TO PLAY? 
                <button id="play-slots-yes">YES</button>
                <button id="play-slots-no">NO</button>
            </div>`);
        } catch (error) {
            console.error("Error playing slots:", error);
            this.addToGameDisplay(`<div class="message">ERROR PLAYING SLOTS.</div>`);
        }
    }
    
    // Play a round of slots
    playSlotRound() {
        try {
            // Deduct money
            this.money -= 1;
            
            // Generate three random symbols (using numbers 33-42 as in the original game)
            const symbol1 = Math.floor(Math.random() * 10) + 33;
            const symbol2 = Math.floor(Math.random() * 10) + 33;
            const symbol3 = Math.floor(Math.random() * 10) + 33;
            
            // Display result
            this.addToGameDisplay(`<div class="message">${String.fromCharCode(symbol1)} ${String.fromCharCode(symbol2)} ${String.fromCharCode(symbol3)}</div>`);
            
            // Check for wins
            if (symbol1 === symbol2 && symbol2 === symbol3) {
                this.money += 15; // Win $1500
                this.addToGameDisplay(`<div class="message">TRIPLES!!!!!! YOU WIN $1500</div>`);
            } else if (symbol1 === symbol2 || symbol2 === symbol3 || symbol1 === symbol3) {
                this.money += 3; // Win $300
                this.addToGameDisplay(`<div class="message">A PAIR! YOU WIN $300</div>`);
            } else {
                this.addToGameDisplay(`<div class="message">YOU LOSE!</div>`);
            }
            
            // Check if we're out of money
            if (this.money < 1) {
                this.addToGameDisplay(`<div class="message">I'M BROKE!!!- THAT MEANS DEATH!!!!!!!!</div>`);
                this.gameOver();
                return;
            }
            
            this.addToGameDisplay(`<div class="message">YOU HAVE $${this.money}00</div>`);
            this.addToGameDisplay(`<div class="system-message">
                PLAY AGAIN? 
                <button id="play-slots-yes">YES</button>
                <button id="play-slots-no">NO</button>
            </div>`);
        } catch (error) {
            console.error("Error playing slot round:", error);
            this.addToGameDisplay(`<div class="message">ERROR PLAYING SLOTS.</div>`);
        }
    }
    
    // Play blackjack mini-game
    playBlackjack() {
        try {
            // Check if we're in the 21 room
            if (this.currentRoom !== 14) {
                this.addToGameDisplay(`<div class="message">THERE ARE NO CARD GAMES HERE</div>`);
                return;
            }
            
            // Reset blackjack state
            this.blackjackState = {
                playerCards: [],
                dealerCards: [],
                playerTotal: 0,
                dealerTotal: 0,
                bet: 0,
                gamePhase: 'betting' // betting, player, dealer, result
            };
            
            // Check if we have money
            if (this.money < 1) {
                this.addToGameDisplay(`<div class="message">I'M BROKE!!!</div>`);
                return;
            }
            
            this.addToGameDisplay(`<div class="message">YOU HAVE $${this.money}00</div>`);
            this.addToGameDisplay(`<div class="system-message">
                HOW MANY DOLLARS WOULD YOU LIKE TO BET? (IN $100 INCREMENTS)
                <input type="number" id="blackjack-bet" min="1" max="${this.money}" value="1">
                <button id="place-bet">PLACE BET</button>
            </div>`);
        } catch (error) {
            console.error("Error playing blackjack:", error);
            this.addToGameDisplay(`<div class="message">ERROR PLAYING BLACKJACK.</div>`);
        }
    }
    
    // Place a bet for blackjack
    placeBlackjackBet(bet) {
        try {
            // Validate bet
            bet = parseInt(bet);
            if (isNaN(bet) || bet < 1 || bet > this.money) {
                this.addToGameDisplay(`<div class="message">INVALID BET</div>`);
                return;
            }
            
            // Store bet
            this.blackjackState.bet = bet;
            this.blackjackState.gamePhase = 'player';
            
            // Deal initial cards
            this.blackjackState.playerCards = [this.dealBlackjackCard(), this.dealBlackjackCard()];
            this.blackjackState.dealerCards = [this.dealBlackjackCard(), this.dealBlackjackCard()];
            
            // Calculate totals
            this.blackjackState.playerTotal = this.calculateBlackjackTotal(this.blackjackState.playerCards);
            this.blackjackState.dealerTotal = this.calculateBlackjackTotal(this.blackjackState.dealerCards);
            
            // Display cards
            this.addToGameDisplay(`<div class="message">DEALER'S CARDS: [HIDDEN], ${this.blackjackState.dealerCards[1]}</div>`);
            this.addToGameDisplay(`<div class="message">YOUR CARDS: ${this.blackjackState.playerCards.join(', ')}</div>`);
            this.addToGameDisplay(`<div class="message">YOUR TOTAL: ${this.blackjackState.playerTotal}</div>`);
            
            // Check for blackjack
            if (this.blackjackState.playerTotal === 21) {
                this.addToGameDisplay(`<div class="message">YOU'VE GOT ***BLACKJACK***</div>`);
                this.money += this.blackjackState.bet * 1.5;
                this.addToGameDisplay(`<div class="message">YOU WIN $${this.blackjackState.bet * 150}</div>`);
                this.blackjackState.gamePhase = 'result';
                this.blackjackGameEnd();
                return;
            }
            
            // Player's turn
            this.addToGameDisplay(`<div class="system-message">
                WOULD YOU LIKE A HIT? 
                <button id="blackjack-hit">YES</button>
                <button id="blackjack-stand">NO</button>
            </div>`);
        } catch (error) {
            console.error("Error placing blackjack bet:", error);
            this.addToGameDisplay(`<div class="message">ERROR PLACING BET.</div>`);
        }
    }
    
    // Deal a card for blackjack
    dealBlackjackCard() {
        // Original game uses values 1-13 for cards
        const value = Math.floor(Math.random() * 13) + 1;
        
        if (value === 1) return 'A';
        if (value === 11) return 'J';
        if (value === 12) return 'Q';
        if (value === 13) return 'K';
        return value.toString();
    }
    
    // Calculate blackjack hand total
    calculateBlackjackTotal(cards) {
        let total = 0;
        let aces = 0;
        
        for (const card of cards) {
            if (card === 'A') {
                total += 11;
                aces += 1;
            } else if (card === 'J' || card === 'Q' || card === 'K') {
                total += 10;
            } else {
                total += parseInt(card);
            }
        }
        
        // Adjust for aces if needed
        while (total > 21 && aces > 0) {
            total -= 10;
            aces -= 1;
        }
        
        return total;
    }
    
    // Player hits in blackjack
    blackjackHit() {
        try {
            // Deal a card
            const card = this.dealBlackjackCard();
            this.blackjackState.playerCards.push(card);
            
            // Calculate new total
            this.blackjackState.playerTotal = this.calculateBlackjackTotal(this.blackjackState.playerCards);
            
            // Display cards
            this.addToGameDisplay(`<div class="message">YOU GET A ${card}</div>`);
            this.addToGameDisplay(`<div class="message">YOUR TOTAL: ${this.blackjackState.playerTotal}</div>`);
            
            // Check for bust
            if (this.blackjackState.playerTotal > 21) {
                this.addToGameDisplay(`<div class="message">BUSTED!</div>`);
                this.money -= this.blackjackState.bet;
                this.blackjackState.gamePhase = 'result';
                this.blackjackGameEnd();
                return;
            }
            
            // Player's turn continues
            this.addToGameDisplay(`<div class="system-message">
                WOULD YOU LIKE ANOTHER HIT? 
                <button id="blackjack-hit">YES</button>
                <button id="blackjack-stand">NO</button>
            </div>`);
        } catch (error) {
            console.error("Error in blackjack hit:", error);
            this.addToGameDisplay(`<div class="message">ERROR DEALING CARD.</div>`);
        }
    }
    
    // Player stands in blackjack
    blackjackStand() {
        try {
            // Dealer's turn
            this.blackjackState.gamePhase = 'dealer';
            
            // Reveal dealer's cards
            this.addToGameDisplay(`<div class="message">DEALER'S CARDS: ${this.blackjackState.dealerCards.join(', ')}</div>`);
            this.addToGameDisplay(`<div class="message">DEALER'S TOTAL: ${this.blackjackState.dealerTotal}</div>`);
            
            // Dealer hits until 17 or higher
            while (this.blackjackState.dealerTotal < 17) {
                const card = this.dealBlackjackCard();
                this.blackjackState.dealerCards.push(card);
                this.blackjackState.dealerTotal = this.calculateBlackjackTotal(this.blackjackState.dealerCards);
                
                this.addToGameDisplay(`<div class="message">DEALER GETS A ${card}</div>`);
                this.addToGameDisplay(`<div class="message">DEALER'S TOTAL: ${this.blackjackState.dealerTotal}</div>`);
            }
            
            // Determine winner
            if (this.blackjackState.dealerTotal > 21) {
                this.addToGameDisplay(`<div class="message">DEALER BUSTS! YOU WIN!</div>`);
                this.money += this.blackjackState.bet;
            } else if (this.blackjackState.dealerTotal > this.blackjackState.playerTotal) {
                this.addToGameDisplay(`<div class="message">DEALER WINS</div>`);
                this.money -= this.blackjackState.bet;
            } else if (this.blackjackState.dealerTotal < this.blackjackState.playerTotal) {
                this.addToGameDisplay(`<div class="message">YOU WIN!</div>`);
                this.money += this.blackjackState.bet;
            } else {
                this.addToGameDisplay(`<div class="message">TIE GAME</div>`);
            }
            
            this.blackjackState.gamePhase = 'result';
            this.blackjackGameEnd();
        } catch (error) {
            console.error("Error in blackjack stand:", error);
            this.addToGameDisplay(`<div class="message">ERROR DURING DEALER'S TURN.</div>`);
        }
    }
    
    // End blackjack game and ask to play again
    blackjackGameEnd() {
        try {
            // Check if out of money
            if (this.money < 1) {
                this.addToGameDisplay(`<div class="message">YOU'RE OUT OF MONEY!! SO LONG!!!!!!!</div>`);
                this.gameOver();
                return;
            }
            
            this.addToGameDisplay(`<div class="message">YOU HAVE $${this.money}00</div>`);
            this.addToGameDisplay(`<div class="system-message">
                PLAY AGAIN? 
                <button id="blackjack-play-again">YES</button>
                <button id="blackjack-quit">NO</button>
            </div>`);
        } catch (error) {
            console.error("Error ending blackjack game:", error);
            this.addToGameDisplay(`<div class="message">ERROR ENDING GAME.</div>`);
        }
    }
    
    // Push/press an object (previously unimplemented)
    pushObject(noun) {
        try {
            // Convert noun to object ID
            const objectId = this.getObjectId(noun);
            
            if (!objectId) {
                this.addToGameDisplay(`<div class="message">PUSH WHAT?</div>`);
                return;
            }
            
            // Check if the object is in the room
            if (!this.isObjectInRoom(objectId) && !this.isObjectInInventory(objectId)) {
                this.addToGameDisplay(`<div class="message">I DON'T SEE THAT HERE!</div>`);
                return;
            }
            
            // Handle specific pushable objects
            switch(objectId) {
                case 14: // Button in hallway
                    if (this.currentRoom === 3) {
                        // Button in bar opens the curtain
                        this.addToGameDisplay(`<div class="message">A VOICE ASKS 'WHATS THE PASSWORD?' (ONE WORD)</div>`);
                        this.addToGameDisplay(`<div class="system-message">
                            ENTER PASSWORD:
                            <input type="text" id="password-input">
                            <button id="submit-password">SUBMIT</button>
                        </div>`);
                    } else {
                        this.addToGameDisplay(`<div class="message">NOTHING HAPPENS</div>`);
                    }
                    break;
                
                case 77: // Stool
                    if (this.currentRoom === 27) {
                        if (this.stoolUsed === 0) {
                            this.addToGameDisplay(`<div class="message">OK</div>`);
                            this.stoolUsed = 1;
                        } else {
                            this.addToGameDisplay(`<div class="message">IT'S ALREADY POSITIONED</div>`);
                        }
                    } else {
                        this.addToGameDisplay(`<div class="message">PUSHING DOESN'T HELP</div>`);
                    }
                    break;
                
                case 46: // Window
                    if (this.currentRoom === 8) {
                        this.addToGameDisplay(`<div class="message">WON'T BUDGE</div>`);
                    } else {
                        this.addToGameDisplay(`<div class="message">NO WINDOW HERE</div>`);
                    }
                    break;
                
                default:
                    this.addToGameDisplay(`<div class="message">PUSHING DOESN'T HELP</div>`);
            }
        } catch (error) {
            console.error("Error pushing object:", error);
            this.addToGameDisplay(`<div class="message">ERROR PUSHING OBJECT.</div>`);
        }
    }
    
    // Check password
    checkPassword(password) {
        try {
            if (password.toUpperCase() === "BELLYBUTTON") {
                this.addToGameDisplay(`<div class="message">THE CURTAIN PULLS BACK!!</div>`);
                // Update room exits to include EAST
                if (this.roomExits[3] && this.roomExits[3][1]) {
                    if (!this.roomExits[3][1].includes("EAST")) {
                        this.roomExits[3][1] = ["NORTH", "WEST", "EAST"];
                    }
                }
                this.updateUI();
            } else {
                this.addToGameDisplay(`<div class="message">WRONG!</div>`);
            }
        } catch (error) {
            console.error("Error checking password:", error);
            this.addToGameDisplay(`<div class="message">ERROR CHECKING PASSWORD.</div>`);
        }
    }
    
    // Seduce a character (previously unimplemented)
    seduceObject(noun) {
        try {
            // Convert noun to object ID
            const objectId = this.getObjectId(noun);
            
            if (!objectId) {
                this.addToGameDisplay(`<div class="message">SEDUCE WHO?</div>`);
                return;
            }
            
            // Check if the object is in the room
            if (!this.isObjectInRoom(objectId)) {
                this.addToGameDisplay(`<div class="message">THEY'RE NOT HERE!</div>`);
                return;
            }
            
            // Handle specific characters
            switch(objectId) {
                case 17: // Hooker
                    if (this.currentRoom === 9) {
                        if (this.hookerDone) {
                            this.addToGameDisplay(`<div class="message">SHE CAN'T TAKE IT ANY MORE!!!!!</div>`);
                        } else if (this.wearingRubber === 0) {
                            this.addToGameDisplay(`<div class="message">OH NO!!!! I'VE GOT THE DREADED ATOMIC CLAP!!! I'M DEAD!!</div>`);
                            this.gameOver();
                        } else {
                            this.addToGameDisplay(`<div class="message">${this.specialTexts[8]}</div>`);
                            this.score = 1;
                            this.hookerDone = true;
                            this.tiedToBed = 1;
                            this.addToGameDisplay(`<div class="message">WELL- THE SCORE IS NOW '1' OUT OF A POSSIBLE '3'.........BUT I'M ALSO TIED TO THE BED AND CAN'T MOVE.</div>`);
                        }
                    } else {
                        this.addToGameDisplay(`<div class="message">SHE'S NOT INTERESTED HERE</div>`);
                    }
                    break;
                
                case 49: // Girl
                    if (this.currentRoom === 16 && this.girlPoints >= 5) {
                        if (this.wineBottle === 1 || this.isObjectInInventory(72)) {
                            this.addToGameDisplay(`<div class="message">${this.specialTexts[23]}</div>`);
                            this.score += 1;
                            this.usingRope = 1; // Rope now available in room
                            this.addToGameDisplay(`<div class="message">THE SCORE IS NOW '${this.score}' OUT OF A POSSIBLE '3'</div>`);
                            
                            if (this.isObjectInInventory(72)) {
                                this.removeFromInventory(72);
                            }
                            
                        } else {
                            this.addToGameDisplay(`<div class="message">SHE SAYS 'GET ME WINE!!! I'M NERVOUS!!'</div>`);
                        }
                    } else if (this.currentRoom === 26 && this.jacuzziApple === 1) {
                        this.addToGameDisplay(`<div class="message">${this.specialTexts[24]}</div>`);
                        this.score += 1;
                        if (this.score >= 3) {
                            this.addToGameDisplay(`<div class="message">WELL......I GUESS THAT'S IT! AS YOUR PUPPET IN THIS GAME I THANK YOU FOR THE PLEASURE YOU HAVE BROUGHT ME.... SO LONG......I'VE GOT TO GET BACK TO MY NEW GIRL HERE! KEEP IT UP!</div>`);
                            this.addToGameDisplay(`<div class="system-message">CONGRATULATIONS! YOU'VE COMPLETED THE GAME!</div>`);
                            this.gameOver = true;
                        } else {
                            this.addToGameDisplay(`<div class="message">THE SCORE IS NOW '${this.score}' OUT OF A POSSIBLE '3'</div>`);
                        }
                    } else {
                        this.addToGameDisplay(`<div class="message">SHE'S NOT INTERESTED</div>`);
                    }
                    break;
                
                case 74: // Inflatable doll
                    if (this.idInflated === 1) {
                        this.addToGameDisplay(`<div class="message">OH BOY!!!!!- IT'S GOT 3 SPOTS TO TRY!!!</div>`);
                        this.addToGameDisplay(`<div class="message">I THRUST INTO THE DOLL- KINKY....EH???</div>`);
                        this.addToGameDisplay(`<div class="message">I START TO INCREASE MY TEMPO...FASTER AND FASTER I GO!!!!</div>`);
                        this.addToGameDisplay(`<div class="message">SUDDENLY THERE'S A FLATULENT NOISE AND THE DOLL BECOMES A POPPED BALLOON SOARING AROUND THE ROOM! IT FLIES OUT OF THE ROOM AND DISAPPEARS!</div>`);
                        
                        if (this.isObjectInInventory(74)) {
                            this.removeFromInventory(74);
                        } else {
                            this.removeFromRoom(this.currentRoom, 74);
                        }
                        
                        this.idInflated = 2; // Popped
                    } else if (this.idInflated === 0) {
                        this.addToGameDisplay(`<div class="message">INFLATE IT FIRST- STUPID!!!</div>`);
                    } else {
                        this.addToGameDisplay(`<div class="message">THE DOLL IS GONE</div>`);
                    }
                    break;
                
                default:
                    this.addToGameDisplay(`<div class="message">PERVERT!</div>`);
            }
            
            this.updateUI();
        } catch (error) {
            console.error("Error seducing object:", error);
            this.addToGameDisplay(`<div class="message">ERROR SEDUCING OBJECT.</div>`);
        }
    }
    
    // Climb an object (previously unimplemented)
    climbObject(noun) {
        try {
            // Convert noun to object ID
            const objectId = this.getObjectId(noun);
            
            if (!objectId) {
                this.addToGameDisplay(`<div class="message">CLIMB WHAT?</div>`);
                return;
            }
            
            // Special cases for climbing
            if (objectId === 77) { // Stool
                this.addToGameDisplay(`<div class="message">OK</div>`);
                this.stoolUsed = 1;
            } else if (objectId === 44 && this.currentRoom === 15 && this.bushesFound === 1) {
                // Climbing bushes in hotel lobby leads to garden
                this.currentRoom = 28;
                this.displayRoom();
            } else {
                this.addToGameDisplay(`<div class="message">I CAN'T CLIMB THAT</div>`);
            }
        } catch (error) {
            console.error("Error climbing object:", error);
            this.addToGameDisplay(`<div class="message">ERROR CLIMBING OBJECT.</div>`);
        }
    }
    
    // Water control (previously unimplemented)
    waterControl(state) {
        try {
            // Check if we're in the kitchen
            if (this.currentRoom !== 27) {
                this.addToGameDisplay(`<div class="message">THERE'S NO WATER CONTROL HERE</div>`);
                return;
            }
            
            if (state === "ON") {
                this.waterOn = 1;
                this.addToGameDisplay(`<div class="message">OK</div>`);
            } else {
                this.waterOn = 0;
                this.addToGameDisplay(`<div class="message">OK</div>`);
            }
        } catch (error) {
            console.error("Error controlling water:", error);
            this.addToGameDisplay(`<div class="message">ERROR CONTROLLING WATER.</div>`);
        }
    }
    
    // Fill an object (previously unimplemented)
    fillObject(noun) {
        try {
            // Convert noun to object ID
            const objectId = this.getObjectId(noun);
            
            if (!objectId) {
                this.addToGameDisplay(`<div class="message">FILL WHAT?</div>`);
                return;
            }
            
            if (objectId === 76) { // Pitcher
                // Check if we have the pitcher
                if (!this.isObjectInInventory(76)) {
                    this.addToGameDisplay(`<div class="message">GET ME THE PITCHER SO I DON'T SPILL IT!</div>`);
                    return;
                }
                
                // Check if we're in the kitchen with water on
                if (this.currentRoom === 27 && this.waterOn === 1) {
                    this.pitcherFull = 1;
                    this.addToGameDisplay(`<div class="message">OK</div>`);
                } else if (this.currentRoom === 27) {
                    this.addToGameDisplay(`<div class="message">NO WATER!!!</div>`);
                } else {
                    this.addToGameDisplay(`<div class="message">FIND A WORKING SINK</div>`);
                }
            } else if (objectId === 82) { // Water
                this.addToGameDisplay(`<div class="message">I NEED SOMETHING TO PUT IT IN</div>`);
            } else {
                this.addToGameDisplay(`<div class="message">I CAN'T FILL THAT</div>`);
            }
        } catch (error) {
            console.error("Error filling object:", error);
            this.addToGameDisplay(`<div class="message">ERROR FILLING OBJECT.</div>`);
        }
    }
    
    // Jump (previously partially implemented)
    jump() {
        try {
            if (this.currentRoom === 8) {
                this.addToGameDisplay(`<div class="message">AAAAAEEEEEIIIIIIII!!!!!!!!!</div>`);
                this.addToGameDisplay(`<div class="message">SPLAAATTTTT!!!!!</div>`);
                this.gameOver();
            } else {
                this.addToGameDisplay(`<div class="message">WHOOOPEEEEE!!!</div>`);
            }
        } catch (error) {
            console.error("Error jumping:", error);
            this.addToGameDisplay(`<div class="message">ERROR JUMPING.</div>`);
        }
    }