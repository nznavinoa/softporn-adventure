// Softporn Adventure - 80s Neon Web Edition
// Game logic adapted from the original 1981 Apple BASIC code

class SoftpornAdventure {
    constructor() {
        // Core game variables
        this.score = 0;
        this.money = 1000; // $10.00 in the original notation
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
        
        // Initialize rooms, objects and inventory
        this.initializeRooms();
        this.initializeObjects();
        this.inventory = [];
        
        // Game output history
        this.gameOutput = [];
    }
    
    initializeRooms() {
        this.rooms = {
            1: { name: "HALLWAY", desc: "I'M IN A HALLWAY." },
            2: { name: "BATHROOM", desc: "I'M IN A BATHROOM." },
            3: { name: "BAR", desc: "I'M IN A SLEAZY BAR." },
            4: { name: "STREET", desc: "I'M ON A STREET OUTSIDE THE BAR." },
            5: { name: "BACKROOM", desc: "I'M IN THE BACKROOM." },
            6: { name: "DUMPSTER", desc: "I'M IN A FILTHY DUMPSTER!" },
            7: { name: "ROOM", desc: "I'M INSIDE THE ROOM I BROKE INTO!" },
            8: { name: "LEDGE", desc: "I'M ON A WINDOW LEDGE." },
            9: { name: "HOOKER_BEDROOM", desc: "I'M IN A HOOKER'S BEDROOM." },
            10: { name: "BALCONY", desc: "I'M ON A HOOKER'S BALCONY." },
            11: { name: "DOWNTOWN", desc: "I'M ON A DOWNTOWN STREET." },
            12: { name: "MARRIAGE_CENTER", desc: "I'M IN A QUICKIE MARRIAGE CENTER." },
            13: { name: "CASINO", desc: "I'M IN THE MAIN CASINO ROOM." },
            14: { name: "BLACKJACK", desc: "I'M IN THE '21 ROOM'." },
            15: { name: "HOTEL_LOBBY", desc: "I'M IN THE LOBBY OF THE HOTEL." },
            16: { name: "HONEYMOON_SUITE", desc: "I'M IN THE HONEYMOON SUITE." },
            17: { name: "HOTEL_HALLWAY", desc: "I'M IN THE HOTEL HALLWAY." },
            18: { name: "HONEYMOON_BALCONY", desc: "I'M ON THE HONEYMOONER'S BALCONY." },
            19: { name: "HOTEL_DESK", desc: "I'M AT THE HOTEL DESK." },
            20: { name: "PHONE_BOOTH", desc: "I'M IN A TELEPHONE BOOTH." },
            21: { name: "DISCO", desc: "I'M IN THE DISCO." },
            22: { name: "RESIDENTIAL", desc: "I'M ON A RESIDENTIAL STREET." },
            23: { name: "DISCO_ENTRANCE", desc: "I'M IN THE DISCO'S ENTRANCE." },
            24: { name: "PHARMACY", desc: "I'M IN THE PHARMACY." },
            25: { name: "PENTHOUSE_FOYER", desc: "I'M IN THE PENTHOUSE FOYER." },
            26: { name: "JACUZZI", desc: "I'M IN THE JACUZZI!" },
            27: { name: "KITCHEN", desc: "I'M IN THE KITCHEN." },
            28: { name: "GARDEN", desc: "I'M IN THE GARDEN." },
            29: { name: "LIVING_ROOM", desc: "I'M IN THE LIVING ROOM." },
            30: { name: "PENTHOUSE_PORCH", desc: "I'M ON THE PENTHOUSE PORCH." }
        };
        
        // Room exits - format: room_id: [direction_type, available_directions]
        this.roomExits = {
            1: [1, ["NORTH", "EAST"]],
            2: [2, ["SOUTH"]],
            3: [3, ["NORTH", "WEST"]],
            4: [4, ["NORTH", "EAST", "WEST"]],
            5: [5, ["WEST", "UP"]],
            6: [6, ["WEST"]],
            7: [7, ["NORTH"]],
            8: [8, ["SOUTH", "EAST"]],
            9: [9, ["NORTH", "DOWN"]],
            10: [10, ["SOUTH", "DOWN"]],
            11: [11, ["SOUTH", "EAST", "WEST"]],
            12: [12, ["EAST", "UP"]],
            13: [13, ["SOUTH", "WEST", "DOWN"]],
            14: [14, ["WEST", "DOWN"]],
            15: [15, ["SOUTH", "WEST"]],
            16: [19, ["EAST"]],
            17: [17, ["NORTH", "EAST", "UP"]],
            18: [18, ["UP"]],
            19: [8, ["SOUTH", "EAST"]],
            20: [19, ["EAST"]],
            21: [17, ["NORTH", "EAST", "UP"]],
            22: [7, ["NORTH"]],
            23: [2, ["SOUTH"]], // Door is initially closed
            24: [6, ["WEST"]],
            25: [12, ["EAST", "UP"]],
            26: [18, ["UP"]],
            27: [6, ["WEST"]],
            28: [19, ["EAST"]],
            29: [9, ["NORTH", "DOWN"]],
            30: [10, ["SOUTH", "DOWN"]]
        };
    }
    
    initializeObjects() {
        // Format: room_id: [list of object IDs]
        this.roomObjects = {
            1: [8, 14, 84], // Desk, Button, Remote control
            2: [9, 11, 12], // Washbasin, Mirror, Toilet
            3: [10, 15, 52, 53], // Graffiti, Bartender, Whiskey, Beer
            4: [18], // Billboard
            5: [16, 33, 20], // Pimp, Table, TV
            6: [56], // Garbage
            7: [],
            8: [46], // Window
            9: [17, 26], // Hooker, Bed
            10: [],
            11: [48], // Sign
            12: [19], // Preacher
            13: [21], // Slot machines
            14: [22, 41], // Cards, Dealer
            15: [44, 47], // Bushes, Plant
            16: [],
            17: [],
            18: [],
            19: [25, 34], // Blonde, Telephone
            20: [34], // Telephone
            21: [32, 49, 60], // Waitress, Girl, Candy
            22: [27, 48], // Bum, Sign
            23: [23, 30], // Curtain, Door
            24: [29, 68, 69], // Display rack, Magazine, Rubber
            25: [],
            26: [49, 36], // Girl, Sink
            27: [38, 39], // Water on/off
            28: [44, 45], // Bushes, Tree
            29: [35, 74], // Closet, Doll
            30: []
        };
        
        // Object names for reference
        this.objectNames = {
            8: "A DESK",
            9: "A WASHBASIN",
            10: "GRAFITTI",
            11: "A MIRROR",
            12: "A TOILET",
            13: "A BUSINESSMAN",
            14: "A BUTTON",
            15: "THE BARTENDER",
            16: "A BIG DUDE!",
            17: "A FUNKY HOOKER",
            18: "A BILLBOARD",
            19: "A PREACHER",
            20: "A TV",
            21: "SLOT MACHINES",
            22: "CARDS",
            23: "A CURTAIN",
            24: "AN ASHTRAY",
            25: "A VOLUPTOUS BLONDE",
            26: "A BED",
            27: "A BUM",
            28: "A PEEP HOLE",
            29: "A DISPLAY RACK",
            30: "A DOOR TO THE WEST",
            32: "A WAITRESS",
            33: "A TABLE",
            34: "A TELEPHONE",
            35: "A CLOSET",
            36: "A SINK",
            38: "WATER ON",
            39: "WATER OFF",
            41: "A DEALER",
            42: "A CABINET",
            43: "AN ELEVATOR",
            44: "BUSHES",
            45: "A TREE",
            46: "A WINDOW",
            47: "A PLANT",
            48: "A SIGN",
            49: "A GIRL",
            50: "A NEWSPAPER",
            51: "A WEDDING RING",
            52: "A SHOT OF WHISKEY",
            53: "A BEER",
            55: "A HAMMER",
            56: "GARBAGE",
            57: "FLOWERS",
            58: "THE CORE OF AN APPLE",
            59: "SEEDS",
            60: "CANDY",
            61: "PILLS",
            64: "A PASSCARD",
            65: "A RADIO",
            66: "A POCKET KNIFE",
            68: "ADVENTUREBOY MAGAZINE",
            69: "A RUBBER",
            72: "A BOTTLE OF WINE",
            73: "A WALLET",
            74: "AN INFLATABLE DOLL",
            75: "AN APPLE",
            76: "A PITCHER",
            77: "A STOOL",
            81: "A ROPE",
            83: "A MUSHROOM",
            84: "A REMOTE CONTROL UNIT"
        };
        
        // Special text content
        this.specialTexts = {
            1: "OH NO!!!!! I PAID FOR THIS?!?!?\nTHIS BEAST IS REALLY UGLY!!!!\nJEEZZZZ.....I HOPE I DON'T GET THE CLAP FROM THIS HOOKER.....................\nWELL...SHE SEEMS TO BE ANNOYED THAT I   HAVEN'T JUMPED ON HER YET....GO TO IT   STUD!!!!!",
            2: "IT'S THE GAMBLER'S GAZETTE!!\nTHERE'S AN ARTICLE HERE WHICH TELLS HOW TO ACTIVATE THE GAMES AT THE    \nADVENTURER'S HOTEL! IT SAYS THAT        BLACKJACK CAN BE PLAYED BY ENTERING\n'PLAY 21'. THE SLOT MACHINES START WITH 'PLAY SLOTS'!\nSE!\n'21' CAN BE BEAT!!                      THE TRICK IS- ALWAYS PLAY WITH BLUE     CARDS AND ALWAYS BET $2!",
            3: "HMMMMM..... AN INTERESTING MAGAZINE WITHA NICE CENTERFOLD!\nTHE FEATURE ARTICLE IS ABOUT HOW TO PICKUP AN INNOCENT GIRL AT A DISCO.\nIT SAYS- 'SHOWER HER WITH PRESENTS.     DANCING WON'T HURT EITHER. \nAND WINE IS ALWAYS GOOD TO GET THINGS   MOVING!'",
            4: "CUTE AND INNOCENT! JUST THE WAY I LIKE  MY WOMEN.\nOH- THIS GIRL IS GREAT! SHE HAS A       BEAUTIFUL CALIFORNIA TAN....AND PERT    LITTLE BREASTS...A TRIM WAIST.........  AND WELL ROUNDED HIPS!!\nI DREAM ABOUT GETTING THIS NICE A GIRL. I HOPE YOU PLAY THIS GAME WELL ENOUGH SOI CAN HAVE MY JOLLYS WITH HER!\nYOU COULD MAKE YOUR PUPPET A VERY HAPPY MAN....................................",
            5: "WHAT A BEAUTIFUL FACE!!! SHE'S LEANING  BACK IN THE JACUZZI WITH HER EYES CLOSEDAND SEEMS EXTREMELY RELAXED.\nTHE WATER IS BUBBLING UP AROUND HER....\nA '10'!! SHE'S SO BEAUTIFUL.............A GUY REALLY COULD FALL IN LOVE WITH\nA GIRL LIKE THIS. I PRESUME HER NAME IS 'EVE'....AT LEAST THATS WHAT THE THE    TOWEL NEXT TO HER HAS EMBROIDERED ON IT.",
            6: "A TAXI PULLS UP AND SCREECHES TO A HALT!\n I GET IN THE BACK AND SIT DOWN.\n A SIGN SAYS 'WE SERVICE 3 DESTINATIONS. WHEN ASKED- PLEASE SPECIFY- DISCO.......CASINO....OR BAR.\nTHE DRIVER TURNS AND ASKS               'WHERE TO MAC??'",
            7: "THE ELEVATOR DOORS OPEN....I GET IN.\nAS THE DOORS CLOSE MUSIC STARTS PLAYING-IT'S THE USUAL ELEVATOR STUFF...BORING!\nWE START TO MOVE.....AFTER A FEW SECONDSTHE ELEVATOR STOPS.\nTHE DOORS OPEN AND I GET OUT.",
            8: "SHE SAYS 'ME FIRST!!!!!\nSHE TAKES MY THROBBING TOOL INTO HER\nMOUTH!!!! SHE STARTS GOING TO WORK......FEELS SO GOOD!!!!!!\nTHEN SHE SMILES AS SHE BITES IT OFF!    SHE SAYS 'NO ORAL SEX IN THIS GAME!!!!!!SUFFER!!!!!!!'",
            9: "WELL MY SON....HERE'S MY STORY.         I CAME HERE MANY YEARS AGO-\nAND MY GOALS WERE THE SAME AS YOURS.....BUT THIS ADVENTURE WAS TOO MUCH FOR ME!\nHERE'S A GIFT.......CARRY IT WITH YOU   AT ALL TIMES!!!!!\nTHERE'S SOME KINKY GIRLS IN THIS TOWN!! AND YOU NEVER KNOW WHEN YOU MAY NEED TO USE THIS TO DEFEND YOURSELF!!!!!!!",
            10: "SHE'S WEARING A THE TIGHTEST JEANS!\nWOW.......WHAT A BODY!!!!! 36-24-35!!   THIS GIRLS DERRIERE IS SENSATIONAL!!\nAND THE SHIRT? SEE THROUGH- AND WHAT I  SEE I LIKE!\nAS MY EYES RELUCTANTLY ROAM FROM HER    BODY I SEE BRIGHT BLUE EYES- AND A SMILETHAT DAZZLES ME. I THINK SHE LIKES ME!"
        };
    }
    
    // Get the name of an item from its ID
    getItemName(itemId) {
        return this.objectNames[itemId] || `UNKNOWN ITEM (${itemId})`;
    }
    
    // Update the room display with image
    displayRoom() {
        let output = "";
        const room = this.rooms[this.currentRoom];
        
        output += `<div class="room-title">${room.desc}</div>`;
        
        // Show available directions
        const directions = this.roomExits[this.currentRoom][1];
        if (directions && directions.length > 0) {
            output += `<div class="directions">OTHER AREAS ARE: ${directions.join(", ")}</div>`;
        } else {
            output += `<div class="directions">THERE ARE NO OBVIOUS EXITS.</div>`;
        }
        
        // Show objects in the room
        const objects = this.roomObjects[this.currentRoom] || [];
        if (objects.length > 0) {
            const objectNames = objects.map(objId => this.getItemName(objId));
            output += `<div class="items">ITEMS IN SIGHT ARE: ${objectNames.join(", ")}</div>`;
        } else {
            output += `<div class="items">THERE ARE NO ITEMS HERE.</div>`;
        }
        
        this.addToGameDisplay(output);
        
        // Also update the location image (for UI display)
        this.updateLocationImage();
        
        return output;
    }
    
    // Update the location image in the UI
    updateLocationImage() {
        // This method doesn't actually do the UI update, but is used by the UI handler
        // to know when to update the location image
    }
    
    // Process a user command
    processCommand(command) {
        if (!command) return;
        
        command = command.trim().toUpperCase();
        
        // Add the command to the game display
        this.addToGameDisplay(`<div class="command">> ${command}</div>`, "command");
        
        // Single character commands
        if (command === "N" || command === "NORTH") {
            this.moveTo("NORTH");
            return;
        } else if (command === "S" || command === "SOUTH") {
            this.moveTo("SOUTH");
            return;
        } else if (command === "E" || command === "EAST") {
            this.moveTo("EAST");
            return;
        } else if (command === "W" || command === "WEST") {
            this.moveTo("WEST");
            return;
        } else if (command === "U" || command === "UP") {
            this.moveTo("UP");
            return;
        } else if (command === "D" || command === "DOWN") {
            this.moveTo("DOWN");
            return;
        } else if (command === "I" || command === "INVENTORY" || command === "INV") {
            this.showInventory();
            return;
        } else if (command === "LOOK") {
            this.displayRoom();
            return;
        } else if (command === "SCORE") {
            this.addToGameDisplay(`<div class="message">YOUR SCORE IS ${this.score} OUT OF '3'</div>`);
            return;
        } else if (command === "Q" || command === "QUIT") {
            this.addToGameDisplay(`<div class="system-message">GAME OVER! REFRESH THE PAGE TO PLAY AGAIN.</div>`);
            return;
        }
        
        // Parse verb-noun commands
        const words = command.split(" ");
        let verb, noun;
        
        if (words.length === 1) {
            verb = words[0];
            noun = null;
        } else {
            verb = words[0];
            noun = words.slice(1).join(" ");
        }
        
        this.executeCommand(verb, noun);
    }
    
    // Execute a parsed command
    executeCommand(verb, noun) {
        // Handle movement
        if (verb === "GO") {
            this.moveTo(noun);
            return;
        }
        
        // Handle looking at objects
        if (["LOOK", "EXAMINE", "READ", "SEARCH"].includes(verb)) {
            this.lookAt(noun);
            return;
        }
        
        // Handle taking objects
        if (["TAKE", "GET", "GRAB"].includes(verb)) {
            this.takeObject(noun);
            return;
        }
        
        // Handle dropping objects
        if (["DROP", "LEAVE", "PLACE", "GIVE"].includes(verb)) {
            this.dropObject(noun);
            return;
        }
        
        // Handle opening things
        if (["OPEN", "PULL"].includes(verb)) {
            this.openObject(noun);
            return;
        }
        
        // Handle buying things
        if (["BUY", "ORDER"].includes(verb)) {
            this.buyObject(noun);
            return;
        }
        
        // Handle using objects
        if (["USE", "WEAR"].includes(verb)) {
            this.useObject(noun);
            return;
        }
        
        // Handle TV commands
        if (verb === "TV") {
            if (noun === "ON") {
                this.tvPower("ON");
            } else if (noun === "OFF") {
                this.tvPower("OFF");
            }
            return;
        }
        
        // Handle playing games
        if (verb === "PLAY") {
            if (noun === "SLOTS") {
                this.playSlots();
            } else if (noun === "21") {
                this.playBlackjack();
            } else {
                this.addToGameDisplay(`<div class="message">PLAYFUL BUGGER, EH??</div>`);
            }
            return;
        }
        
        // Handle pushing
        if (["PUSH", "PRESS"].includes(verb)) {
            this.pushObject(noun);
            return;
        }
        
        // Handle seducing
        if (["FUCK", "SEDUCE", "RAPE", "SCREW"].includes(verb)) {
            this.seduceObject(noun);
            return;
        }
        
        // Handle climbing
        if (verb === "CLIMB") {
            this.climbObject(noun);
            return;
        }
        
        // Handle water controls
        if (verb === "WATER") {
            if (noun === "ON") {
                this.waterControl("ON");
            } else if (noun === "OFF") {
                this.waterControl("OFF");
            }
            return;
        }
        
        // Handle filling objects
        if (verb === "FILL") {
            this.fillObject(noun);
            return;
        }
        
        // Handle jumping
        if (verb === "JUMP") {
            this.jump();
            return;
        }
        
        // If we get here, we don't recognize the command
        this.addToGameDisplay(`<div class="message">I DON'T KNOW HOW TO ${verb} SOMETHING!</div>`);
    }
    
    // Move to a new room
    moveTo(direction) {
        if (this.tiedToBed) {
            this.addToGameDisplay(`<div class="message">BUT I'M TIED TO THE BED!!!!!</div>`);
            return;
        }
        
        if (!direction) {
            this.addToGameDisplay(`<div class="message">WHICH DIRECTION?</div>`);
            return;
        }
        
        // Get available directions for the current room
        const availableDirs = this.roomExits[this.currentRoom][1];
        
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
    }
    
    // Show inventory
    showInventory() {
        if (this.inventory.length === 0) {
            this.addToGameDisplay(`<div class="message">I'M CARRYING NOTHING!!</div>`);
            return;
        }
        
        let items = this.inventory.map(itemId => this.getItemName(itemId)).join(", ");
        this.addToGameDisplay(`<div class="message">I'M CARRYING THE FOLLOWING: ${items}</div>`);
    }
    
    // Look at an object
    lookAt(noun) {
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
                } else {
                    this.addToGameDisplay(`<div class="message">IT'S DRAWER IS SHUT</div>`);
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
                }
                break;
                
            case 30: // Door
                if (this.doorUnlocked === 0) {
                    this.addToGameDisplay(`<div class="message">A SIGN SAYS 'ENTRY BY SHOWING PASSCARD- CLUB MEMBERS AND THEIR GUESTS ONLY!</div>`);
                } else {
                    this.addToGameDisplay(`<div class="message">IT'S UNLOCKED</div>`);
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
                    this.addToGameDisplay(`<div class="message">IT'S OPEN</div>`);
                    if (this.closetOpened === 1) {
                        this.addToGameDisplay(`<div class="message">I SEE SOMETHING!!</div>`);
                        this.closetOpened = 2;
                        this.addToRoom(74); // Add doll
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
    }
    
    // Add an item to the current room
    addToRoom(itemId) {
        if (!this.isObjectInRoom(itemId)) {
            if (!this.roomObjects[this.currentRoom]) {
                this.roomObjects[this.currentRoom] = [];
            }
            this.roomObjects[this.currentRoom].push(itemId);
        }
    }
    
    // Check if an object is in the current room
    isObjectInRoom(objectId) {
        return this.roomObjects[this.currentRoom] && this.roomObjects[this.currentRoom].includes(objectId);
    }
    
    // Check if an object is in inventory
    isObjectInInventory(objectId) {
        return this.inventory.includes(objectId);
    }
    
    // Get object ID from noun
    getObjectId(noun) {
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
    }
    
    // Show graffiti
    showGraffiti() {
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
    }
    
    // Look at billboard
    lookBillboard() {
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
    }
    
    // Read newspaper
    readNewspaper() {
        let output = `<div class="message" style="white-space: pre-line;">THE NEWS!!!
        TODAY THE PRIME RATE WAS RAISED ONCE AGAIN...TO 257%! THIS DOES NOT COME NEAR THE RECORD SET IN 1996- WHEN IT BROKE 
        THE 1000% MARK.........................
        THE BIRTH RATE HAS TAKEN A DRAMATIC FALL....THIS IS DUE TO THE INCREASED USAGE OF COMPUTERS AS SEXUAL PARTNERS..
        HOWEVER....RAPES OF INNOCENT PEOPLE ARE ON THE INCREASE! AND WHO IS THE RAPIST?? COMPUTERIZED BANKING MACHINES LEAD THE LIST....FOLLOWED BY HOME COMPUTERS.....</div>`;
        
        this.addToGameDisplay(output);
    }
    
    // Read magazine
    readMagazine() {
        let output = `<div class="message" style="white-space: pre-line;">HMMMMM..... AN INTERESTING MAGAZINE WITH A NICE CENTERFOLD!
        THE FEATURE ARTICLE IS ABOUT HOW TO PICK UP AN INNOCENT GIRL AT A DISCO.
        IT SAYS- 'SHOWER HER WITH PRESENTS. DANCING WON'T HURT EITHER.
        AND WINE IS ALWAYS GOOD TO GET THINGS MOVING!'</div>`;
        
        this.addToGameDisplay(output);
    }
    
    // Look at hooker
    hookerLook() {
        this.addToGameDisplay(`<div class="message">${this.specialTexts[1]}</div>`);
    }
    
    // Look at blonde
    blondeLook() {
        this.addToGameDisplay(`<div class="message">${this.specialTexts[10]}</div>`);
    }
    
    // Look through peephole
    peepholeLook() {
        let output = `<div class="message" style="white-space: pre-line;">HMMMM..... THIS IS A PEEPING TOMS PARADISE!!!!
        ACROSS THE WAY IS ANOTHER HOTEL. AHAH! THE CURTAINS ARE OPEN AT ONE WINDOW!
        THE BATHROOM DOOR OPENS AND A GIRL WALKS OUT. HOLY COW! HER BOOBS ARE HUGE- AND LOOK AT THE WAY THEY SWAY AS SHE STRIDES ACROSS THE ROOM!
        NOW SHE'S TAKING A LARGE SAUSAGE SHAPED OBJECT AND LOOKING AT IT LONGINGLY! DAMN! SHE SHUTS THE CURTAIN!</div>`;
        
        this.addToGameDisplay(output);
    }
    
    // Look at TV
    tvOnLook() {
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
    }
    
    // Look at girl
    girlLook() {
        if (this.girlPoints > 3) {
            this.addToGameDisplay(`<div class="message">SHE SLAPS ME AND YELLS 'PERVERT!!!!!!'</div>`);
        } else {
            this.addToGameDisplay(`<div class="message">${this.specialTexts[4]}</div>`);
        }
    }
    
    // Look at girl in jacuzzi
    girlLookRoom26() {
        this.addToGameDisplay(`<div class="message">${this.specialTexts[5]}</div>`);
    }
    
    // Look at rubber
    lookRubber() {
        const color = this.rubberColor || "GENERIC";
        const flavor = this.rubberFlavor || "UNFLAVORED";
        const lubricated = this.rubberLubricated ? "LUBRICATED" : "NON-LUBRICATED";
        const ribbed = this.rubberRibbed ? "RIBBED" : "SMOOTH";
        
        if (!this.rubberColor) {
            this.addToGameDisplay(`<div class="message">IT'S A RUBBER.</div>`);
        } else {
            this.addToGameDisplay(`<div class="message">IT'S ${color}, ${flavor}-FLAVORED, ${lubricated}, AND ${ribbed}</div>`);
        }
    }
    
    // Take an object
    takeObject(noun) {
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
        
        // Update the display
        this.displayRoom();
    }
    
    // Remove an item from a room
    removeFromRoom(roomId, itemId) {
        if (this.roomObjects[roomId] && this.roomObjects[roomId].includes(itemId)) {
            const index = this.roomObjects[roomId].indexOf(itemId);
            if (index !== -1) {
                this.roomObjects[roomId].splice(index, 1);
            }
        }
    }
    
    // Add an item to a specific room
    addToRoomById(roomId, itemId) {
        if (!this.roomObjects[roomId]) {
            this.roomObjects[roomId] = [];
        }
        if (!this.roomObjects[roomId].includes(itemId)) {
            this.roomObjects[roomId].push(itemId);
        }
    }
    
    // Drop an object
    dropObject(noun) {
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
        
        // Update the display
        this.displayRoom();
    }
    
    // Remove an item from inventory
    removeFromInventory(itemId) {
        const index = this.inventory.indexOf(itemId);
        if (index !== -1) {
            this.inventory.splice(index, 1);
        }
    }
    
    // Open an object
    openObject(noun) {
        if (!noun) {
            this.addToGameDisplay(`<div class="message">OPEN WHAT?</div>`);
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
        
        // Handle specific objects
        switch (objectId) {
            case 8: // Desk drawer
                if (this.currentRoom !== 1) {
                    this.addToGameDisplay(`<div class="message">NOT YET, BUT MAYBE LATER................</div>`);
                    return;
                }
                this.addToGameDisplay(`<div class="message">OK</div>`);
                this.drawerOpened = 1;
                break;
                
            case 30: // Door to disco
                if (this.currentRoom !== 23) {
                    this.addToGameDisplay(`<div class="message">NOT YET, BUT MAYBE LATER................</div>`);
                    return;
                }
                
                // Check for passcard
                if (!this.isObjectInInventory(64)) {
                    this.addToGameDisplay(`<div class="message">A VOICE ASKS 'PASSCARD??' I SEARCH IN MY POCKETS AND...</div>`);
                    this.addToGameDisplay(`<div class="message">I DON'T HAVE IT!</div>`);
                    return;
                }
                
                this.addToGameDisplay(`<div class="message">A VOICE ASKS 'PASSCARD??' I SEARCH IN MY POCKETS AND...</div>`);
                this.addToGameDisplay(`<div class="message">I HAVE IT! THE DOOR OPENS!</div>`);
                this.doorUnlocked = 1;
                this.roomExits[23][0] = 15; // Change exit type to allow west
                break;
                
            case 35: // Closet
                if (this.currentRoom !== 29) {
                    this.addToGameDisplay(`<div class="message">NOT YET, BUT MAYBE LATER................</div>`);
                    return;
                }
                
                this.addToGameDisplay(`<div class="message">OK</div>`);
                this.closetOpened = 1;
                break;
                
            case 42: // Cabinet
                if (this.stoolUsed === 0) {
                    this.addToGameDisplay(`<div class="message">I CAN'T REACH IT!!</div>`);
                } else {
                    this.addToGameDisplay(`<div class="message">IT'S ALREADY OPEN!</div>`);
                }
                break;
                
            case 46: // Window
                this.addToGameDisplay(`<div class="message">WON'T BUDGE</div>`);
                break;
                
            default:
                this.addToGameDisplay(`<div class="message">UMMM..........................HUH??</div>`);
        }
    }
    
    // TV power on/off
    tvPower(state) {
        if (this.currentRoom !== 5) {
            this.addToGameDisplay(`<div class="message">NO TV!</div>`);
            return;
        }
        
        if (!this.isObjectInInventory(84)) {
            this.addToGameDisplay(`<div class="message">I NEED THE REMOTE CONTROL UNIT!</div>`);
            return;
        }
        
        if (state === "OFF") {
            this.tvOn = 0;
            this.addToGameDisplay(`<div class="message">OK</div>`);
            return;
        }
        
        if (state === "ON") {
            if (this.score === 0) {
                this.addToGameDisplay(`<div class="message">THE DUDE WON'T LET ME!!</div>`);
                return;
            }
            
            this.tvOn = 1;
            this.tvOnLook();
            
            // Let the user know they can choose a channel
            this.addToGameDisplay(`<div class="system-message">CHOOSE A CHANNEL (1-9): <select id="channel-select">
                <option value="">Select...</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9</option>
            </select></div>`);
            
            // Event will be handled by the UI
        }
    }
    
    // Choose a TV channel
    chooseChannel(channel) {
        const channelNum = parseInt(channel);
        
        // Special case for channel 6 - distracts the pimp
        if (channelNum === 6) {
            this.blondeGirlDrugged = 1;
        }
        
        // Show TV content
        this.tvOnLook();
        
        this.addToGameDisplay(`<div class="system-message">CHANGE THE CHANNEL? <button id="yes-channel">Y</button> <button id="no-channel">N</button></div>`);
    }
    
    // Play slot machines
    playSlots() {
        if (this.currentRoom !== 13) {
            this.addToGameDisplay(`<div class="message">OK, SHOW ME YOUR SLOT.....</div>`);
            return;
        }
        
        this.addToGameDisplay(`<div class="message">THIS WILL COST $100 EACH TIME</div>`);
        this.addToGameDisplay(`<div class="message">YOU HAVE $${this.money}00</div>`);
        
        this.addToGameDisplay(`<div class="system-message">WOULD YOU LIKE TO PLAY? <button id="yes-slots">Y</button> <button id="no-slots">N</button></div>`);
    }
    
    // Handle slot machine play
    playSlotRound() {
        // Generate random slot machine symbols
        const symbol1 = String.fromCharCode(Math.floor(Math.random() * 10) + 33);
        const symbol2 = String.fromCharCode(Math.floor(Math.random() * 10) + 33);
        const symbol3 = String.fromCharCode(Math.floor(Math.random() * 10) + 33);
        
        this.addToGameDisplay(`<div class="message">${symbol1}  ${symbol2}  ${symbol3}</div>`);
        
        // Check for wins
        if (symbol1 === symbol2 && symbol2 === symbol3) {
            this.addToGameDisplay(`<div class="message">TRIPLES!!!!!! YOU WIN $1500</div>`);
            this.money += 15;
        } else if (symbol1 === symbol2 || symbol2 === symbol3 || symbol1 === symbol3) {
            this.addToGameDisplay(`<div class="message">A PAIR! YOU WIN $300</div>`);
            this.money += 3;
        } else {
            this.money -= 1;
            if (this.money < 1) {
                this.addToGameDisplay(`<div class="message">I'M BROKE!!!- THAT MEANS DEATH!!!!!!!!</div>`);
                this.gameOver();
                return;
            }
            this.addToGameDisplay(`<div class="message">YOU LOSE!</div>`);
        }
        
        this.addToGameDisplay(`<div class="message">YOU HAVE $${this.money}00</div>`);
        this.addToGameDisplay(`<div class="system-message">WOULD YOU LIKE TO PLAY? <button id="yes-slots">Y</button> <button id="no-slots">N</button></div>`);
    }
    
    // Play blackjack
    playBlackjack() {
        if (this.currentRoom !== 14) {
            this.addToGameDisplay(`<div class="message">NOT YET, BUT MAYBE LATER................</div>`);
            return;
        }
        
        this.addToGameDisplay(`<div class="message">YOU HAVE $${this.money}00</div>`);
        
        // Ask for bet amount with an input field
        this.addToGameDisplay(`<div class="system-message">
            HOW MANY DOLLARS WOULD YOU LIKE TO BET? 
            <input type="number" id="bet-amount" min="100" max="${this.money * 100}" step="100" value="100">
            <button id="place-bet">BET</button>
        </div>`);
    }
    
    // Start blackjack game
    startBlackjack(betAmount) {
        betAmount = parseInt(betAmount);
        
        if (betAmount > this.money * 100) {
            this.addToGameDisplay(`<div class="message">YOU DON'T HAVE THAT MUCH!!!</div>`);
            return;
        }
        
        if (betAmount % 100 !== 0) {
            this.addToGameDisplay(`<div class="message">$100 INCREMENTS ONLY!!</div>`);
            return;
        }
        
        const bet = betAmount / 100;
        this.addToGameDisplay(`<div class="message">OK</div>`);
        
        // Initialize game state for blackjack
        this.blackjackState = {
            playerTotal: 0,
            dealerTotal: 0,
            playerAces: 0,
            dealerAces: 0,
            bet: bet,
            phase: 'dealing'
        };
        
        // Deal initial cards
        for (let i = 1; i <= 4; i++) {
            const { cardValue, cardName, isAce } = this.dealCard();
            
            if (i === 1 || i === 3) { // Player's cards
                this.addToGameDisplay(`<div class="message">YOU'RE DEALT A${cardName}</div>`);
                this.blackjackState.playerTotal += cardValue;
                if (isAce) {
                    this.blackjackState.playerAces += 1;
                }
            } else { // Dealer's cards
                if (i === 2) {
                    this.addToGameDisplay(`<div class="message">THE DEALER GETS A CARD DOWN</div>`);
                } else {
                    this.addToGameDisplay(`<div class="message">THE DEALER GETS A${cardName}</div>`);
                }
                this.blackjackState.dealerTotal += cardValue;
                if (isAce) {
                    this.blackjackState.dealerAces += 1;
                }
            }
        }
        
        // Adjust for aces if needed
        while (this.blackjackState.playerTotal > 21 && this.blackjackState.playerAces > 0) {
            this.blackjackState.playerAces -= 1;
            this.blackjackState.playerTotal -= 10;
        }
        
        // Show player's total
        this.addToGameDisplay(`<div class="message">YOUR TOTAL IS ${this.blackjackState.playerTotal}</div>`);
        
        // Check for blackjack
        if (this.blackjackState.playerTotal === 21 && this.blackjackState.playerAces === 1) {
            this.addToGameDisplay(`<div class="message">YOU'VE GOT ***BLACKJACK***</div>`);
            this.money += this.blackjackState.bet * 5;
            this.addToGameDisplay(`<div class="message">YOU HAVE $${this.money}00</div>`);
            
            this.addToGameDisplay(`<div class="system-message">PLAY AGAIN?? <button id="yes-blackjack">Y</button> <button id="no-blackjack">N</button></div>`);
            return;
        }
        
        if (this.blackjackState.dealerTotal === 21 && this.blackjackState.dealerAces === 1) {
            this.addToGameDisplay(`<div class="message">THE DEALER HAS ***BLACKJACK***</div>`);
            this.money -= this.blackjackState.bet;
            this.addToGameDisplay(`<div class="message">YOU HAVE $${this.money}00</div>`);
            
            if (this.money === 0) {
                this.addToGameDisplay(`<div class="message">YOU'RE OUT OF MONEY!!</div>`);
                this.addToGameDisplay(`<div class="message">SO LONG!!!!!!!!!!</div>`);
                this.gameOver();
                return;
            }
            
            this.addToGameDisplay(`<div class="system-message">PLAY AGAIN?? <button id="yes-blackjack">Y</button> <button id="no-blackjack">N</button></div>`);
            return;
        }
        
        // Player's turn
        this.blackjackState.phase = 'player';
        this.addToGameDisplay(`<div class="system-message">WOULD YOU LIKE A HIT? <button id="yes-hit">Y</button> <button id="no-hit">N</button></div>`);
    }
    
    // Player hits in blackjack
    blackjackHit() {
        if (this.blackjackState.phase !== 'player') return;
        
        const { cardValue, cardName, isAce } = this.dealCard();
        this.addToGameDisplay(`<div class="message">YOU GET A${cardName}</div>`);
        this.blackjackState.playerTotal += cardValue;
        if (isAce) {
            this.blackjackState.playerAces += 1;
        }
        
        // Adjust for aces if needed
        while (this.blackjackState.playerTotal > 21 && this.blackjackState.playerAces > 0) {
            this.blackjackState.playerAces -= 1;
            this.blackjackState.playerTotal -= 10;
        }
        
        this.addToGameDisplay(`<div class="message">YOUR TOTAL IS ${this.blackjackState.playerTotal}</div>`);
        
        if (this.blackjackState.playerTotal > 21) {
            this.addToGameDisplay(`<div class="message">BUSTED!</div>`);
            this.money -= this.blackjackState.bet;
            this.addToGameDisplay(`<div class="message">YOU HAVE $${this.money}00</div>`);
            
            if (this.money === 0) {
                this.addToGameDisplay(`<div class="message">YOU'RE OUT OF MONEY!!</div>`);
                this.addToGameDisplay(`<div class="message">SO LONG!!!!!!!!!!</div>`);
                this.gameOver();
                return;
            }
            
            this.addToGameDisplay(`<div class="system-message">PLAY AGAIN?? <button id="yes-blackjack">Y</button> <button id="no-blackjack">N</button></div>`);
            return;
        }
        
        this.addToGameDisplay(`<div class="system-message">WOULD YOU LIKE A HIT? <button id="yes-hit">Y</button> <button id="no-hit">N</button></div>`);
    }
    
    // Player stands in blackjack
    blackjackStand() {
        if (this.blackjackState.phase !== 'player') return;
        
        this.blackjackState.phase = 'dealer';
        
        // Dealer's turn
        while (this.blackjackState.dealerTotal < 17) {
            const { cardValue, cardName, isAce } = this.dealCard();
            this.addToGameDisplay(`<div class="message">THE DEALER GETS A${cardName}</div>`);
            this.blackjackState.dealerTotal += cardValue;
            if (isAce) {
                this.blackjackState.dealerAces += 1;
            }
            
            // Adjust for aces if needed
            while (this.blackjackState.dealerTotal > 21 && this.blackjackState.dealerAces > 0) {
                this.blackjackState.dealerAces -= 1;
                this.blackjackState.dealerTotal -= 10;
            }
        }
        
        this.addToGameDisplay(`<div class="message">THE DEALER HAS ${this.blackjackState.dealerTotal}</div>`);
        
        // Determine winner
        if (this.blackjackState.dealerTotal > 21) {
            this.addToGameDisplay(`<div class="message">YOU WIN!!</div>`);
            this.money += this.blackjackState.bet;
        } else if (this.blackjackState.playerTotal < this.blackjackState.dealerTotal) {
            this.addToGameDisplay(`<div class="message">YOU LOSE!</div>`);
            this.money -= this.blackjackState.bet;
        } else if (this.blackjackState.playerTotal === this.blackjackState.dealerTotal) {
            this.addToGameDisplay(`<div class="message">TIE!</div>`);
        } else {
            this.addToGameDisplay(`<div class="message">YOU WIN!!</div>`);
            this.money += this.blackjackState.bet;
        }
        
        this.addToGameDisplay(`<div class="message">YOU HAVE $${this.money}00</div>`);
        
        if (this.money === 0) {
            this.addToGameDisplay(`<div class="message">YOU'RE OUT OF MONEY!!</div>`);
            this.addToGameDisplay(`<div class="message">SO LONG!!!!!!!!!!</div>`);
            this.gameOver();
            return;
        }
        
        this.addToGameDisplay(`<div class="system-message">PLAY AGAIN?? <button id="yes-blackjack">Y</button> <button id="no-blackjack">N</button></div>`);
    }
    
    // Deal a card for blackjack
    dealCard() {
        const cardValue = Math.floor(Math.random() * 13) + 1;
        let cardName = "";
        let actualValue = cardValue;
        let isAce = false;
        
        if (cardValue === 1) {
            cardName = "N ACE";
            actualValue = 11;
            isAce = true;
        } else if (cardValue === 11) {
            cardName = " JACK";
            actualValue = 10;
        } else if (cardValue === 12) {
            cardName = " QUEEN";
            actualValue = 10;
        } else if (cardValue === 13) {
            cardName = " KING";
            actualValue = 10;
        } else if (cardValue === 10) {
            cardName = " 10";
        } else {
            cardName = " " + cardValue;
        }
        
        return { cardValue: actualValue, cardName, isAce };
    }
    
    // Push an object
    pushObject(noun) {
        if (!noun) {
            this.addToGameDisplay(`<div class="message">PUSH WHAT?</div>`);
            return;
        }
        
        // Convert noun to object ID
        const objectId = this.getObjectId(noun);
        
        if (!objectId) {
            this.addToGameDisplay(`<div class="message">I DON'T SEE THAT HERE!!</div>`);
            return;
        }
        
        // Handle specific objects
        if (objectId === 14 && this.currentRoom === 3) { // Button in bar
            this.addToGameDisplay(`<div class="system-message">A VOICE ASKS 'WHATS THE PASSWORD?' (ONE WORD) <input type="text" id="password-input"><button id="submit-password">SUBMIT</button></div>`);
            return;
        } else if (objectId === 14 && this.currentRoom === 19) { // Button in hotel
            if (this.blondeGirlDrugged === 0) {
                this.addToGameDisplay(`<div class="message">THE BLONDE SAYS 'YOU CAN'T GO THERE!'</div>`);
                return;
            }
            
            this.addToGameDisplay(`<div class="message">${this.specialTexts[7]}</div>`);
            this.currentRoom = 25;
            this.displayRoom();
            return;
        } else if (objectId === 14 && this.currentRoom === 25) { // Button in penthouse
            this.addToGameDisplay(`<div class="message">${this.specialTexts[7]}</div>`);
            this.currentRoom = 19;
            this.displayRoom();
            return;
        } else if (objectId === 44 && this.currentRoom === 15 && this.bushesFound === 1) {
            this.currentRoom = 28;
            this.displayRoom();
            return;
        } else if (objectId === 46 && this.currentRoom === 8) {
            this.moveTo("SOUTH");
            return;
        } else if (objectId === 49) { // Girl
            this.addToGameDisplay(`<div class="message">SHE KICKS ME IN THE STOMACH AND LAUGHS!!</div>`);
            return;
        }
        
        this.addToGameDisplay(`<div class="message">PUSHY CHUMP, EH???</div>`);
    }
    
    // Handle password submission
    submitPassword(password) {
        password = password.toUpperCase();
        
        if (password.startsWith("BELL")) {
            this.addToGameDisplay(`<div class="message">THE CURTAIN PULLS BACK!!</div>`);
            this.roomExits[3][0] = 4; // Change exit type to allow east
        } else {
            this.addToGameDisplay(`<div class="message">WRONG!</div>`);
        }
    }
    
    // Seduce an object/character
    seduceObject(noun) {
        if (noun.toUpperCase() === "YOU") {
            this.addToGameDisplay(`<div class="message">NOT TONIGHT- I HAVE A HEADACHE!</div>`);
            return;
        }
        
        // Convert noun to object ID
        const objectId = this.getObjectId(noun);
        
        if (!objectId) {
            this.addToGameDisplay(`<div class="message">I DON'T SEE THAT HERE!!</div>`);
            return;
        }
        
        // Handle specific objects
        if (objectId === 17 && this.currentRoom === 9) { // Hooker
            if (this.hookerDone) {
                this.addToGameDisplay(`<div class="message">SHE CAN'T TAKE IT ANY MORE!!!!!</div>`);
                return;
            }
            
            if (!this.wearingRubber) {
                this.addToGameDisplay(`<div class="message">OH NO!!!! I'VE GOT THE DREADED ATOMIC CLAP!!! I'M DEAD!!</div>`);
                this.gameOver();
                return;
            }
            
            this.addToGameDisplay(`<div class="message">${this.specialTexts[8]}</div>`);
            this.score = 1;
            this.hookerDone = true;
            return;
        } else if (objectId === 74) { // Inflatable doll
            if (this.idInflated === 0) {
                this.addToGameDisplay(`<div class="message">INFLATE IT FIRST- STUPID!!!</div>`);
                return;
            }
            
            if (this.idInflated === 1) {
                this.addToGameDisplay(`<div class="message">OH BOY!!!!!- IT'S GOT 3 SPOTS TO TRY!!!\nI THRUST INTO THE DOLL- KINKY....EH???\nI START TO INCREASE MY TEMPO...FASTER AND FASTER I GO!!!!\nSUDDENLY THERE'S A FLATULENT NOISE AND THE DOLL BECOMES A POPPED BALLOON SOARING AROUND THE ROOM! IT FLIES OUT OF THE ROOM AND DISAPPEARS!</div>`);
                this.idInflated = 2;
                
                // Remove doll from inventory if it's there
                if (this.isObjectInInventory(74)) {
                    this.removeFromInventory(74);
                }
                // Or remove from room if it's there
                else if (this.isObjectInRoom(74)) {
                    this.removeFromRoom(this.currentRoom, 74);
                }
                
                return;
            }
        } else if (objectId === 49) { // Girl
            if (this.currentRoom === 26) { // Girl in jacuzzi
                if (!this.jacuzziApple) {
                    this.addToGameDisplay(`<div class="message">NOT YET, BUT MAYBE LATER................</div>`);
                    return;
                }
                
                this.addToGameDisplay(`<div class="message">SHE HOPS OUT OF THE TUB- THE STEAM RISING FROM HER SKIN.......HER BODY IS\nTHE BEST LOOKING I'VE EVER SEEN!!!\nTHEN SHE COMES UP TO ME AND GIVES THE BEST TIME OF MY LIFE!!!\nWELL......I GUESS THAT'S IT! AS YOUR PUPPET IN THIS GAME I THANK YOU FOR THE PLEASURE YOU HAVE BROUGHT ME.... SO LONG......I'VE GOT TO GET BACK TO MY NEW GIRL HERE! KEEP IT UP!</div>`);
                this.score = 3;
                this.addToGameDisplay(`<div class="message">YOUR SCORE IS ${this.score} OUT OF '3'</div>`);
                this.addToGameDisplay(`<div class="system-message">GAME COMPLETE! YOU WON WITH THE MAXIMUM SCORE!</div>`);
                return;
            } else if (this.girlPoints >= 5 && this.currentRoom === 16) { // Girl in honeymoon suite
                if (this.girlPoints !== 6) {
                    this.addToGameDisplay(`<div class="message">SHE SAYS 'GET ME WINE!!! I'M NERVOUS!!'</div>`);
                    return;
                }
                
                this.addToGameDisplay(`<div class="message">SHE SAYS 'LAY DOWN HONEY- LET ME GIVE YOU A SPECIAL SUPRISE!!\nI LAY DOWN AND SHE SAYS 'OK- NOW CLOSE YOUR EYES'. I CLOSE MY EYES AND SHE SHE STARTS TO GO TO WORK ON ME.........\nI'M REALLY ENJOYING MYSELF WHEN SUDDENLY SHE TIES ME TO THE BED!!!! THEN SHE SAYS 'SO LONG- TURKEY!' AND RUNS OUT OF THE ROOM!!!</div>`);
                this.addToGameDisplay(`<div class="message">WELL- THE SCORE IS NOW '2' OUT OF A POSSIBLE '3'.........BUT I'M ALSO TIED TO THE BED AND CAN'T MOVE.</div>`);
                this.score = 2;
                this.tiedToBed = true;
                
                // Add rope to the room for the player to potentially cut later
                this.addToRoom(81);
                return;
            }
        } else if (objectId === 32) { // Waitress
            this.addToGameDisplay(`<div class="message">SHE KICKS ME IN THE GROIN AND SAYS 'WISE UP- BUSTER!!'</div>`);
            return;
        } else if (objectId === 25) { // Blonde
            this.addToGameDisplay(`<div class="message">SHE SAYS 'I'M WORKING! LEAVE ME ALONE!'</div>`);
            return;
        } else if (objectId === 16) { // Pimp
            this.addToGameDisplay(`<div class="message">HE SAYS 'YOU'LL NEVER HAVE ENOUGH MONEY FOR ME- FOOL!!!' I GUESS HE'S GAY!</div>`);
            return;
        } else if (objectId === 27) { // Bum
            this.addToGameDisplay(`<div class="message">TO DO THAT I NEED VASELINE!!</div>`);
            return;
        } else if (objectId === 15) { // Bartender
            this.addToGameDisplay(`<div class="message">HE JUMPS OVER THE BAR AND KILLS ME!!</div>`);
            this.gameOver();
            return;
        } else if (objectId === 13) { // Businessman
            this.addToGameDisplay(`<div class="message">NO WAY!!! YOU'RE WIERD!!</div>`);
            return;
        }
        
        this.addToGameDisplay(`<div class="message">PERVERT!</div>`);
    }
    
    // Climb an object
    climbObject(noun) {
        if (!noun) {
            this.addToGameDisplay(`<div class="message">CLIMB WHAT?</div>`);
            return;
        }
        
        // Convert noun to object ID
        const objectId = this.getObjectId(noun);
        
        if (!objectId) {
            this.addToGameDisplay(`<div class="message">I DON'T SEE THAT HERE!!</div>`);
            return;
        }
        
        // Handle specific objects
        if (objectId === 77) { // Stool
            if (!this.isObjectInRoom(77)) {
                this.addToGameDisplay(`<div class="message">IT'S NOT ON THE FLOOR HERE!</div>`);
                return;
            }
            
            this.addToGameDisplay(`<div class="message">OK</div>`);
            this.stoolUsed = 1;
            return;
        }
        
        this.addToGameDisplay(`<div class="message">IT'S NOT ON THE FLOOR HERE!</div>`);
    }
    
    // Get room with object
    getRoomWithObject(objectId) {
        for (const [roomId, objects] of Object.entries(this.roomObjects)) {
            if (objects.includes(objectId)) {
                return parseInt(roomId);
            }
        }
        return null;
    }
    
    // Water control (on/off)
    waterControl(state) {
        if (this.currentRoom !== 27) {
            this.addToGameDisplay(`<div class="message">FIND A WORKING SINK</div>`);
            return;
        }
        
        if (state === "ON") {
            this.addToGameDisplay(`<div class="message">OK</div>`);
            this.waterOn = 1;
        } else if (state === "OFF") {
            this.addToGameDisplay(`<div class="message">OK</div>`);
            this.waterOn = 0;
        }
    }
    
    // Fill an object
    fillObject(noun) {
        if (!noun) {
            this.addToGameDisplay(`<div class="message">FILL WHAT?</div>`);
            return;
        }
        
        // Check for pitcher in inventory
        if (!this.isObjectInInventory(76)) {
            this.addToGameDisplay(`<div class="message">GET ME THE PITCHER SO I DON'T SPILL IT!</div>`);
            return;
        }
        
        // Check if at sink with water running
        if (this.currentRoom !== 27 || this.waterOn !== 1) {
            this.addToGameDisplay(`<div class="message">NO WATER!!!</div>`);
            return;
        }
        
        this.addToGameDisplay(`<div class="message">OK</div>`);
        this.pitcherFull = 1;
    }
    
    // Use/wear an object
    useObject(noun) {
        if (!noun) {
            this.addToGameDisplay(`<div class="message">USE WHAT?</div>`);
            return;
        }
        
        // Convert noun to object ID
        const objectId = this.getObjectId(noun);
        
        if (!objectId) {
            this.addToGameDisplay(`<div class="message">I DON'T SEE THAT HERE!!</div>`);
            return;
        }
        
        // Check if the object is in inventory
        if (!this.isObjectInInventory(objectId)) {
            this.addToGameDisplay(`<div class="message">I DON'T HAVE IT!!</div>`);
            return;
        }
        
        // Handle specific objects
        if (objectId === 69) { // Rubber
            this.wearingRubber = 1;
            this.addToGameDisplay(`<div class="message">IT TICKLES!!!!</div>`);
            return;
        } else if (objectId === 12) { // Toilet
            this.addToGameDisplay(`<div class="message">...........I GOT THOSE CONSTIPATION BLUES..............................</div>`);
            this.addToGameDisplay(`<div class="message">AHHH...RELIEF! THANKS!</div>`);
            return;
        } else if (objectId === 26) { // Bed
            this.addToGameDisplay(`<div class="message">AHHHHH........SLEEP!!!</div>`);
            this.addToGameDisplay(`<div class="message">YOUR DISK IS SNORING!!! I CAN'T SLEEP!</div>`);
            return;
        } else if (objectId === 81) { // Rope
            if (this.currentRoom !== 7 && this.currentRoom !== 10) {
                this.addToGameDisplay(`<div class="message">NOT YET, BUT MAYBE LATER................</div>`);
                return;
            }
            
            this.usingRope = 1;
            this.addToGameDisplay(`<div class="message">OK</div>`);
            return;
        } else if (objectId === 64) { // Passcard
            if (this.currentRoom === 23) {
                this.openObject("DOOR");
                return;
            } else {
                this.addToGameDisplay(`<div class="message">I DON'T SEE A PLACE TO USE IT HERE.</div>`);
                return;
            }
        } else if (objectId === 66) { // Knife
            if (this.currentRoom === 16 && this.tiedToBed) {
                this.addToGameDisplay(`<div class="message">I DO AND IT WORKED! THANKS!</div>`);
                this.tiedToBed = false;
                return;
            }
            this.addToGameDisplay(`<div class="message">TRY GIVING IT TO HER</div>`);
            return;
        } else if (objectId === 54) { // Bag
            this.addToGameDisplay(`<div class="message">TRY GIVING IT TO HER</div>`);
            return;
        }
        
        this.addToGameDisplay(`<div class="message">I DON'T KNOW HOW TO USE THAT.</div>`);
    }
    
    // Buy an object
    buyObject(noun) {
        if (!noun) {
            this.addToGameDisplay(`<div class="message">BUY WHAT?</div>`);
            return;
        }
        
        // Check if we have enough money
        if (this.money < 1) {
            this.addToGameDisplay(`<div class="message">NO MONEY!!!</div>`);
            return;
        }
        
        // Convert noun to object ID
        const objectId = this.getObjectId(noun);
        
        if (!objectId) {
            this.addToGameDisplay(`<div class="message">I DON'T SEE THAT HERE!!</div>`);
            return;
        }
        
        // Handle specific objects
        if ((objectId === 52 || objectId === 53) && this.currentRoom === 3) { // Buying drinks at bar
            if ((objectId === 52 && this.whiskeybought) || (objectId === 53 && this.beerBought)) {
                this.addToGameDisplay(`<div class="message">SORRY...TEMPORARILY SOLD OUT</div>`);
                return;
            }
            
            this.addToGameDisplay(`<div class="message">I GIVE THE BARTENDER $100 AND HE PLACES IT ON THE BAR.</div>`);
            this.money -= 1;
            
            if (objectId === 52) {
                this.whiskeybought = true;
            } else {
                this.beerBought = true;
            }
            
            // Add the item to the room
            this.addToRoom(objectId);
            return;
        } else if (objectId === 72 && this.currentRoom === 21) { // Buying wine at disco
            if (this.wineBottle) {
                this.addToGameDisplay(`<div class="message">SORRY....ALL OUT!</div>`);
                return;
            }
            
            this.addToGameDisplay(`<div class="message">THE WAITRESS TAKES $100 AND SAYS SHE'LL RETURN</div>`);
            setTimeout(() => {
                this.addToGameDisplay(`<div class="message">POOR SERVICE!</div>`);
            }, 2000);
            
            this.money -= 1;
            this.wineBottle = true;
            
            // Add wine to the room
            this.addToRoom(72);
            return;
        } else if (objectId === 69 && this.currentRoom === 24) { // Buying rubber at pharmacy
            if (this.rubberColor) {
                this.addToGameDisplay(`<div class="message">ALL OUT!!</div>`);
                return;
            }
            
            this.addToGameDisplay(`<div class="message">THE MAN LEANS OVER THE COUNTER AND WHISPERS:</div>`);
            
            // Add form for rubber properties
            this.addToGameDisplay(`<div class="system-message">
                <div>WHAT COLOR? <input type="text" id="rubber-color" placeholder="RED"></div>
                <div>AND FOR A FLAVOR?? <input type="text" id="rubber-flavor" placeholder="CHERRY"></div>
                <div>LUBRICATED OR NOT? <button id="rubber-lub-yes">Y</button> <button id="rubber-lub-no">N</button></div>
                <div>RIBBED? <button id="rubber-rib-yes">Y</button> <button id="rubber-rib-no">N</button></div>
                <button id="buy-rubber">PURCHASE</button>
            </div>`);
            
            return;
        } else if (objectId === 68) { // Magazine
            if (!this.isObjectInRoom(objectId)) {
                this.addToGameDisplay(`<div class="message">NOT YET, BUT MAYBE LATER................</div>`);
                return;
            }
            
            this.addToGameDisplay(`<div class="message">HE TAKES $100 AND GIVES ME THE MAGAZINE</div>`);
            this.money -= 1;
            
            // Remove magazine from room
            this.removeFromRoom(this.currentRoom, 68);
            
            // Add magazine to inventory
            this.inventory.push(68);
            return;
        }
        
        this.addToGameDisplay(`<div class="message">NOT YET, BUT MAYBE LATER................</div>`);
    }
    
    // Complete rubber purchase
    buyRubber(color, flavor, lubricated, ribbed) {
        this.rubberColor = color.toUpperCase();
        this.rubberFlavor = flavor.toUpperCase();
        this.rubberLubricated = lubricated;
        this.rubberRibbed = ribbed;
        
        this.addToGameDisplay(`<div class="message">HE YELLS- THIS PERVERT JUST BOUGHT A ${this.rubberColor}, ${this.rubberFlavor}-FLAVORED</div>`);
        this.addToGameDisplay(`<div class="message">${this.rubberLubricated ? 'LUBRICATED' : 'NON-LUBRICATED'}, ${this.rubberRibbed ? 'RIBBED' : 'SMOOTH'} RUBBER!!!!!</div>`);
        this.addToGameDisplay(`<div class="message">A LADY WALKS BY AND LOOKS AT ME IN DISGUST!!!!</div>`);
        
        this.money -= 1;
        
        // Add rubber to inventory
        this.inventory.push(69);
    }
    
    // Jump
    jump() {
        if (this.currentRoom !== 8) {
            this.addToGameDisplay(`<div class="message">WHOOOPEEEEE!!!</div>`);
            return;
        }
        
        this.addToGameDisplay(`<div class="message">AAAAAEEEEEIIIIIIII!!!!!!!!!</div>`);
        this.addToGameDisplay(`<div class="message">SPLAAATTTTT!!!!!</div>`);
        
        if (this.currentRoom === 10 && this.usingRope === 0) {
            this.addToGameDisplay(`<div class="message">I SHOULD HAVE USED SAFETY ROPE!!!!!!!!</div>`);
            this.gameOver();
            return;
        }
        
        // You die if you jump off the ledge
        this.gameOver();
    }
    
    // Game over
    gameOver() {
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
    }
    
    // Choose a door in the game over screen
    chooseDoor(door) {
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
    }
    
    // Add content to the game display
    addToGameDisplay(content, className = "") {
        this.gameOutput.push({ content, className });
        // The actual display updating is handled by the UI
    }
    
    // Start the game
    start() {
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
    }
    
    // Initialize game after intro
    initializeGame() {
        this.addToGameDisplay(`<div class="message">
            PLEASE WAIT
            INITIALIZATION PHASE
        </div>`);
        
        setTimeout(() => {
            // Display the starting room
            this.displayRoom();
        }, 1000);
    }
}

// UI Handler for the Softporn Adventure game
class GameUI {
    constructor() {
        this.game = new SoftpornAdventure();
        this.gameDisplay = document.getElementById('game-display');
        this.commandInput = document.getElementById('command-input');
        this.contextButtons = document.getElementById('context-buttons');
        this.locationImage = document.getElementById('location-image');
        this.locationName = document.getElementById('location-name');
        this.selectedVerb = null;
        this.setupEventListeners();
        
        // Set up intro screen
        document.getElementById('start-game').addEventListener('click', () => {
            document.getElementById('intro-screen').style.display = 'none';
            this.startGame();
        });
    }
    
    // Start the game
    startGame() {
        this.game.start();
        this.updateGameDisplay();
    }
    
    // Update the game display with the latest output
    updateGameDisplay() {
        // Check if there's new content to display
        if (this.game.gameOutput.length > 0) {
            // Append all new content
            for (const output of this.game.gameOutput) {
                const element = document.createElement('div');
                element.innerHTML = output.content;
                if (output.className) {
                    element.className = output.className;
                }
                this.gameDisplay.appendChild(element);
            }
            
            // Clear the output array
            this.game.gameOutput = [];
            
            // Scroll to the bottom
            this.gameDisplay.scrollTop = this.gameDisplay.scrollHeight;
            
            // Set up any dynamic elements that were added
            this.setupDynamicElements();
            
            // Update context buttons based on the current room
            this.updateContextButtons();
            
            // Update location image
            this.updateLocationFrame();
        }
    }
    
    // Update the location image frame
    updateLocationFrame() {
        const roomId = this.game.currentRoom;
        const roomName = this.game.rooms[roomId].name;
        
        // Update the location name
        this.locationName.textContent = roomName;
        
        // Set a class to the image div based on the location
        this.locationImage.className = 'location-image';
        this.locationImage.classList.add(`location-${roomId}`);
        
        // Try to set the image if available
        const imagePath = `images/locations/${roomId}.jpg`;
        
        // Check if image exists (we could use fetch but for simplicity let's just add styling)
        this.locationImage.style.backgroundImage = `url('${imagePath}')`;
        
        // If your images follow a different naming convention, adjust the above
        
        // You could also add specific styling for each location
        switch(roomId) {
            case 3: // BAR
                this.locationImage.style.backgroundColor = 'rgba(100, 0, 100, 0.3)';
                break;
            case 9: // HOOKER'S BEDROOM
                this.locationImage.style.backgroundColor = 'rgba(150, 0, 50, 0.3)';
                break;
            case 21: // DISCO
                this.locationImage.style.backgroundColor = 'rgba(0, 100, 150, 0.3)';
                break;
            case 26: // JACUZZI
                this.locationImage.style.backgroundColor = 'rgba(0, 150, 200, 0.3)';
                break;
            default:
                this.locationImage.style.backgroundColor = 'rgba(0, 1, 35, 0.6)';
        }
    }
    
    // Update context buttons based on current room items and inventory
    updateContextButtons() {
        // Clear existing buttons
        this.contextButtons.innerHTML = '';
        
        // Get objects in the current room
        const roomObjects = this.game.roomObjects[this.game.currentRoom] || [];
        
        // Add buttons for room objects
        roomObjects.forEach(objId => {
            // Skip adding buttons for very common or unmovable objects
            if (objId >= 8) {  // Most interactive objects are above ID 8
                const objName = this.game.getItemName(objId).replace(/^A |AN |THE /i, '');
                this.addNounButton(objName, objId);
            }
        });
        
        // Add buttons for inventory items
        this.game.inventory.forEach(objId => {
            const objName = this.game.getItemName(objId).replace(/^A |AN |THE /i, '');
            this.addNounButton(objName, objId);
        });
    }
    
    // Add a noun button to the context buttons
    addNounButton(name, objId) {
        // Limit to first word for simpler display
        const shortName = name.split(' ')[0];
        
        // Create and add the button if it doesn't already exist
        if (!document.querySelector(`.noun-btn[data-obj-id="${objId}"]`)) {
            const button = document.createElement('button');
            button.className = 'noun-btn';
            button.textContent = shortName;
            button.setAttribute('data-obj-id', objId);
            button.setAttribute('data-name', shortName);
            
            // Add click event
            button.addEventListener('click', () => {
                if (this.selectedVerb) {
                    // If a verb is selected, combine them
                    const command = `${this.selectedVerb} ${shortName}`;
                    this.game.processCommand(command);
                    this.resetVerbSelection();
                    this.updateGameDisplay();
                } else {
                    // If no verb selected, default to LOOK
                    const command = `LOOK ${shortName}`;
                    this.game.processCommand(command);
                    this.updateGameDisplay();
                }
            });
            
            this.contextButtons.appendChild(button);
        }
    }
    
    // Reset verb selection
    resetVerbSelection() {
        document.querySelectorAll('.verb-btn').forEach(btn => {
            btn.classList.remove('selected-verb');
        });
        this.selectedVerb = null;
    }
    
    // Set up event listeners for the UI
    setupEventListeners() {
        // Command input
        this.commandInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const command = this.commandInput.value.trim();
                if (command) {
                    this.game.processCommand(command);
                    this.commandInput.value = '';
                    this.resetVerbSelection();
                    this.updateGameDisplay();
                }
            }
        });
        
        // Direction buttons
        document.querySelectorAll('.direction-btn').forEach(button => {
            button.addEventListener('click', () => {
                const command = button.getAttribute('data-command');
                this.game.processCommand(command);
                this.resetVerbSelection();
                this.updateGameDisplay();
            });
        });
        
        // Action buttons
        document.querySelectorAll('.action-btn').forEach(button => {
            button.addEventListener('click', () => {
                const command = button.getAttribute('data-command');
                this.game.processCommand(command);
                this.resetVerbSelection();
                this.updateGameDisplay();
            });
        });
        
        // Verb buttons
        document.querySelectorAll('.verb-btn').forEach(button => {
            button.addEventListener('click', () => {
                // Toggle selection of this verb
                if (button.classList.contains('selected-verb')) {
                    // Deselect if already selected
                    this.resetVerbSelection();
                } else {
                    // Select this verb
                    this.resetVerbSelection();
                    button.classList.add('selected-verb');
                    this.selectedVerb = button.getAttribute('data-verb');
                }
            });
        });
    }
    
    // Set up dynamic elements that were added to the display
    setupDynamicElements() {
        // Game loading button
        const noLoadBtn = document.getElementById('no-load');
        if (noLoadBtn) {
            noLoadBtn.addEventListener('click', () => {
                this.game.initializeGame();
                this.updateGameDisplay();
            });
        }
        
        // Door selection in game over screen
        document.querySelectorAll('[id^="door-"]').forEach(button => {
            button.addEventListener('click', () => {
                const door = button.id.split('-')[1];
                this.game.chooseDoor(door);
                this.updateGameDisplay();
            });
        });
        
        // Password submission
        const submitPasswordBtn = document.getElementById('submit-password');
        if (submitPasswordBtn) {
            submitPasswordBtn.addEventListener('click', () => {
                const password = document.getElementById('password-input').value;
                this.game.submitPassword(password);
                this.updateGameDisplay();
            });
        }
        
        // TV channel selection
        const channelSelect = document.getElementById('channel-select');
        if (channelSelect) {
            channelSelect.addEventListener('change', () => {
                if (channelSelect.value) {
                    this.game.chooseChannel(channelSelect.value);
                    this.updateGameDisplay();
                }
            });
        }
        
        // Change TV channel
        const yesChannelBtn = document.getElementById('yes-channel');
        if (yesChannelBtn) {
            yesChannelBtn.addEventListener('click', () => {
                this.game.tvPower('ON');
                this.updateGameDisplay();
            });
        }
        
        const noChannelBtn = document.getElementById('no-channel');
        if (noChannelBtn) {
            noChannelBtn.addEventListener('click', () => {
                // Do nothing, just close the dialog
                this.updateGameDisplay();
            });
        }
        
        // Slot machine play
        const yesSlots = document.getElementById('yes-slots');
        if (yesSlots) {
            yesSlots.addEventListener('click', () => {
                this.game.playSlotRound();
                this.updateGameDisplay();
            });
        }
        
        const noSlots = document.getElementById('no-slots');
        if (noSlots) {
            noSlots.addEventListener('click', () => {
                // Just close the prompt
                this.updateGameDisplay();
            });
        }
        
        // Blackjack
        const placeBetBtn = document.getElementById('place-bet');
        if (placeBetBtn) {
            placeBetBtn.addEventListener('click', () => {
                const betAmount = document.getElementById('bet-amount').value;
                this.game.startBlackjack(betAmount);
                this.updateGameDisplay();
            });
        }
        
        // Blackjack hit button
        const yesHitBtn = document.getElementById('yes-hit');
        if (yesHitBtn) {
            yesHitBtn.addEventListener('click', () => {
                this.game.blackjackHit();
                this.updateGameDisplay();
            });
        }
        
        // Blackjack stand button
        const noHitBtn = document.getElementById('no-hit');
        if (noHitBtn) {
            noHitBtn.addEventListener('click', () => {
                this.game.blackjackStand();
                this.updateGameDisplay();
            });
        }
        
        // Blackjack play again button
        const yesBlackjackBtn = document.getElementById('yes-blackjack');
        if (yesBlackjackBtn) {
            yesBlackjackBtn.addEventListener('click', () => {
                this.game.playBlackjack();
                this.updateGameDisplay();
            });
        }
        
        const noBlackjackBtn = document.getElementById('no-blackjack');
        if (noBlackjackBtn) {
            noBlackjackBtn.addEventListener('click', () => {
                // Just close the prompt
                this.updateGameDisplay();
            });
        }
        
        // Rubber purchase form
        const buyRubberBtn = document.getElementById('buy-rubber');
        if (buyRubberBtn) {
            buyRubberBtn.addEventListener('click', () => {
                const color = document.getElementById('rubber-color').value || 'RED';
                const flavor = document.getElementById('rubber-flavor').value || 'CHERRY';
                
                // Get lubrication status from buttons
                let lubricated = true;
                document.getElementById('rubber-lub-yes').addEventListener('click', () => {
                    lubricated = true;
                });
                document.getElementById('rubber-lub-no').addEventListener('click', () => {
                    lubricated = false;
                });
                
                // Get ribbed status from buttons
                let ribbed = true;
                document.getElementById('rubber-rib-yes').addEventListener('click', () => {
                    ribbed = true;
                });
                document.getElementById('rubber-rib-no').addEventListener('click', () => {
                    ribbed = false;
                });
                
                this.game.buyRubber(color, flavor, lubricated, ribbed);
                this.updateGameDisplay();
            });
        }
    }
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const gameUI = new GameUI();
});