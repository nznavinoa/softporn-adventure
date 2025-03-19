import random
import time
import os
import sys

class SoftpornAdventure:
    def __init__(self):
        """Initialize the game state and variables"""
        # Core game variables
        self.score = 0
        self.money = 1000  # $10.00 in the original game's notation
        self.current_room = 3  # Start in the bar
        self.game_over = False
        
        # Game state flags
        self.drawer_examined = 0
        self.toilet_examined = 0
        self.drawer_opened = 0
        self.closet_opened = 0
        self.water_on = 0
        self.stool_used = 0
        self.cabinet_opened = 0
        self.id_inflated = 0
        self.tv_on = 0
        self.girl_points = 0
        self.wine_given = 0
        self.wearing_rubber = 0
        self.using_rope = 0
        self.blonde_girl_drugged = 0
        self.wine_bottle = 0
        self.rescued_hooker = 0
        self.dumpster_checked = 0
        self.apple_core = 0
        self.apple_seeds = 0
        self.tied_to_bed = 0
        self.door_unlocked = 0
        
        # Initialize room connections and descriptions
        self.initialize_rooms()
        
        # Initialize objects in rooms
        self.initialize_objects()
        
        # Initialize inventory
        self.inventory = []

    def initialize_rooms(self):
        """Set up room descriptions and connections"""
        self.rooms = {
            1: {"name": "HALLWAY", "desc": "I'M IN A HALLWAY."},
            2: {"name": "BATHROOM", "desc": "I'M IN A BATHROOM."},
            3: {"name": "BAR", "desc": "I'M IN A SLEAZY BAR."},
            4: {"name": "STREET", "desc": "I'M ON A STREET OUTSIDE THE BAR."},
            5: {"name": "BACKROOM", "desc": "I'M IN THE BACKROOM."},
            6: {"name": "DUMPSTER", "desc": "I'M IN A FILTHY DUMPSTER!"},
            7: {"name": "ROOM", "desc": "I'M INSIDE THE ROOM I BROKE INTO!"},
            8: {"name": "LEDGE", "desc": "I'M ON A WINDOW LEDGE."},
            9: {"name": "HOOKER_BEDROOM", "desc": "I'M IN A HOOKER'S BEDROOM."},
            10: {"name": "BALCONY", "desc": "I'M ON A HOOKER'S BALCONY."},
            11: {"name": "DOWNTOWN", "desc": "I'M ON A DOWNTOWN STREET."},
            12: {"name": "MARRIAGE_CENTER", "desc": "I'M IN A QUICKIE MARRIAGE CENTER."},
            13: {"name": "CASINO", "desc": "I'M IN THE MAIN CASINO ROOM."},
            14: {"name": "BLACKJACK", "desc": "I'M IN THE '21 ROOM'."},
            15: {"name": "HOTEL_LOBBY", "desc": "I'M IN THE LOBBY OF THE HOTEL."},
            16: {"name": "HONEYMOON_SUITE", "desc": "I'M IN THE HONEYMOON SUITE."},
            17: {"name": "HOTEL_HALLWAY", "desc": "I'M IN THE HOTEL HALLWAY."},
            18: {"name": "HONEYMOON_BALCONY", "desc": "I'M ON THE HONEYMOONER'S BALCONY."},
            19: {"name": "HOTEL_DESK", "desc": "I'M AT THE HOTEL DESK."},
            20: {"name": "PHONE_BOOTH", "desc": "I'M IN A TELEPHONE BOOTH."},
            21: {"name": "DISCO", "desc": "I'M IN THE DISCO."},
            22: {"name": "RESIDENTIAL", "desc": "I'M ON A RESIDENTIAL STREET."},
            23: {"name": "DISCO_ENTRANCE", "desc": "I'M IN THE DISCO'S ENTRANCE."},
            24: {"name": "PHARMACY", "desc": "I'M IN THE PHARMACY."},
            25: {"name": "PENTHOUSE_FOYER", "desc": "I'M IN THE PENTHOUSE FOYER."},
            26: {"name": "JACUZZI", "desc": "I'M IN THE JACUZZI!"},
            27: {"name": "KITCHEN", "desc": "I'M IN THE KITCHEN."},
            28: {"name": "GARDEN", "desc": "I'M IN THE GARDEN."},
            29: {"name": "LIVING_ROOM", "desc": "I'M IN THE LIVING ROOM."},
            30: {"name": "PENTHOUSE_PORCH", "desc": "I'M ON THE PENTHOUSE PORCH."}
        }
        
        # Room exits - format: room_id: [direction_type, available_directions]
        # Direction types: 
        # 1: N, E | 2: S | 3: N, W | 4: N, E, W | 5: W, UP | 6: W | 7: N 
        # 8: S, E | 9: N, DOWN | 10: S, DOWN | 11: S, E, W | 12: E, UP
        # 13: S, W, DOWN | 14: W, DOWN | 15: S, W | 17: N, E, UP | 18: UP | 19: E
        self.room_exits = {
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
            23: [2, ["SOUTH"]],  # Door is initially closed
            24: [6, ["WEST"]],
            25: [12, ["EAST", "UP"]],
            26: [18, ["UP"]],
            27: [6, ["WEST"]],
            28: [19, ["EAST"]],
            29: [9, ["NORTH", "DOWN"]],
            30: [10, ["SOUTH", "DOWN"]]
        }

    def initialize_objects(self):
        """Set up objects and their locations"""
        # Format: room_id: [list of object IDs]
        self.room_objects = {
            1: [8, 14, 84],  # Desk, Button, Remote control
            2: [9, 11, 12],  # Washbasin, Mirror, Toilet
            3: [10, 15, 52, 53],  # Graffiti, Bartender, Whiskey, Beer
            4: [18],  # Billboard
            5: [16, 33, 20],  # Pimp, Table, TV
            6: [56],  # Garbage
            7: [],
            8: [46],  # Window
            9: [17, 26],  # Hooker, Bed
            10: [],
            11: [48],  # Sign
            12: [19],  # Preacher
            13: [21],  # Slot machines
            14: [22, 41],  # Cards, Dealer
            15: [44, 47],  # Bushes, Plant
            16: [],
            17: [],
            18: [],
            19: [25, 34],  # Blonde, Telephone
            20: [34],  # Telephone
            21: [32, 49, 60],  # Waitress, Girl, Candy
            22: [27, 48],  # Bum, Sign
            23: [23, 30],  # Curtain, Door
            24: [29, 68, 69],  # Display rack, Magazine, Rubber
            25: [],
            26: [49, 36],  # Girl, Sink
            27: [38, 39],  # Water on/off
            28: [44, 45],  # Bushes, Tree
            29: [35, 74],  # Closet, Doll
            30: []
        }
        
        # Special "hidden" objects that can be found
        self.hidden_objects = {
            "DRAWER": {"found": False, "reveals": 50},  # Newspaper
            "WASHBASIN": {"found": False, "reveals": 51},  # Wedding ring
            "ASHTRAY": {"found": False, "reveals": 64},  # Passcard
            "DISPLAY_RACK": {"found": False, "reveals": 68},  # Magazine
            "CABINET": {"found": False, "reveals": 76},  # Pitcher
            "TREE": {"found": False, "reveals": 75},  # Apple
            "APPLE_CORE": {"found": False, "reveals": 59},  # Seeds
            "GARBAGE": {"found": False, "reveals": 58},  # Apple core
            "CLOSET": {"found": False, "reveals": 74}  # Doll
        }
        
        # Object names for reference
        self.object_names = {
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
        }
        
        # Messages for objects when examined
        self.object_look_messages = {
            8: "IT'S DRAWER IS SHUT",
            9: "DEAD COCKROACHES....",
            10: lambda: self.show_graffiti(),
            11: "THERE'S A PERVERT LOOKING BACK AT ME!!!",
            12: "HASN'T BEEN FLUSHED IN AGES! STINKS!!!!",
            13: "HE LOOKS LIKE A WHISKEY DRINKER TO ME!!",
            14: "SAYS PUSH",
            15: "HE'S WAITING FOR ME TO BUY SOMETHING!",
            16: "HE'S WEARING A BUTTON PROCLAIMING-      SUPPORT YOUR LOCAL PIMP, GIMME $2000!!!",
            17: lambda: self.hooker_look(),
            18: lambda: self.look_billboard(),
            20: lambda: "ONLY IF YOU TURN IT ON! SAY 'TV ON'" if self.tv_on == 0 else self.tv_on_look(),
            21: "PLAYING THEM MIGHT BE MORE FUN....",
            23: "IT'S ON THE EAST WALL",
            24: "I SEE SOMETHING!!",
            25: lambda: self.blonde_look(),
            27: "HE GRUMBLES- I'LL TELL YOU A STORY FOR  A BOTTLE OF WINE.....",
            28: lambda: self.peephole_look(),
            29: "I SEE SOMETHING!!",
            30: lambda: "A SIGN SAYS 'ENTRY BY SHOWING PASSCARD- CLUB MEMBERS AND THEIR GUESTS ONLY!" if self.door_unlocked == 0 else "IT'S UNLOCKED",
            32: "SHE IGNORES YOU!",
            34: lambda: "A NUMBER IS THERE- 'CALL 555-6969 FOR A GOOD TIME!'" if self.current_room == 20 else "IT LOOKS LIKE A TELEPHONE!",
            35: lambda: "IT'S CLOSED" if self.closet_opened == 0 else "IT'S OPEN",
            36: "A SIGN SAYS 'WATER ON OR OFF TO OPERATE'",
            42: lambda: "IT'S TOO HIGH!" if self.stool_used == 0 else "I SEE SOMETHING!!",
            44: "ENTERING THEM WOULD BE KINKY!!",
            45: "I SEE SOMETHING!!",
            47: lambda: self.plant_look(),
            48: "IT SAYS 'HAIL TAXI HERE'",
            49: lambda: self.girl_look_room26() if self.current_room == 26 else self.girl_look(),
            50: lambda: self.read_newspaper(),
            56: lambda: "I SEE SOMETHING!!" if self.dumpster_checked == 0 else "JUST TRASH",
            58: lambda: "I SEE SOMETHING!!" if self.apple_core == 0 else "JUST A CORE",
            61: "THE LABEL ON THE BOTTLE SAYS 'WANT TO   DRIVE SOMEONE CRAZY WITH LUST??         TRY THIS!!!!",
            65: "MAYBE I SHOULD LISTEN....",
            68: lambda: self.read_magazine(),
            69: lambda: self.look_rubber(),
            73: lambda: f"IT CONTAINS ${self.money}00",
            74: lambda: "IT'S INFLATED" if self.id_inflated == 1 else "IT'S ROLLED UP IN A LITTLE BALL!",
            76: lambda: "IT'S EMPTY" if self.pitcher_full == 0 else "IT'S FULL",
            # Add more look messages as needed
        }

        # Special text messages for rooms and events
        self.special_texts = {
            1: "OH NO!!!!! I PAID FOR THIS?!?!?\nTHIS BEAST IS REALLY UGLY!!!!\nJEEZZZZ.....I HOPE I DON'T GET THE CLAP FROM THIS HOOKER.....................\nWELL...SHE SEEMS TO BE ANNOYED THAT I   HAVEN'T JUMPED ON HER YET....GO TO IT   STUD!!!!!",
            2: "IT'S THE GAMBLER'S GAZETTE!!\nTHERE'S AN ARTICLE HERE WHICH TELLS HOW TO ACTIVATE THE GAMES AT THE    \nADVENTURER'S HOTEL! IT SAYS THAT        BLACKJACK CAN BE PLAYED BY ENTERING\n'PLAY 21'. THE SLOT MACHINES START WITH 'PLAY SLOTS'!\nSE!\n'21' CAN BE BEAT!!                      THE TRICK IS- ALWAYS PLAY WITH BLUE     CARDS AND ALWAYS BET $2!",
            3: "HMMMMM..... AN INTERESTING MAGAZINE WITHA NICE CENTERFOLD!\nTHE FEATURE ARTICLE IS ABOUT HOW TO PICKUP AN INNOCENT GIRL AT A DISCO.\nIT SAYS- 'SHOWER HER WITH PRESENTS.     DANCING WON'T HURT EITHER. \nAND WINE IS ALWAYS GOOD TO GET THINGS   MOVING!'",
            4: "CUTE AND INNOCENT! JUST THE WAY I LIKE  MY WOMEN.\nOH- THIS GIRL IS GREAT! SHE HAS A       BEAUTIFUL CALIFORNIA TAN....AND PERT    LITTLE BREASTS...A TRIM WAIST.........  AND WELL ROUNDED HIPS!!\nI DREAM ABOUT GETTING THIS NICE A GIRL. I HOPE YOU PLAY THIS GAME WELL ENOUGH SOI CAN HAVE MY JOLLYS WITH HER!\nYOU COULD MAKE YOUR PUPPET A VERY HAPPY MAN....................................",
            5: "WHAT A BEAUTIFUL FACE!!! SHE'S LEANING  BACK IN THE JACUZZI WITH HER EYES CLOSEDAND SEEMS EXTREMELY RELAXED.\nTHE WATER IS BUBBLING UP AROUND HER....\nA '10'!! SHE'S SO BEAUTIFUL.............A GUY REALLY COULD FALL IN LOVE WITH\nA GIRL LIKE THIS. I PRESUME HER NAME IS 'EVE'....AT LEAST THATS WHAT THE THE    TOWEL NEXT TO HER HAS EMBROIDERED ON IT.",
            6: "A TAXI PULLS UP AND SCREECHES TO A HALT!\n I GET IN THE BACK AND SIT DOWN.\n A SIGN SAYS 'WE SERVICE 3 DESTINATIONS. WHEN ASKED- PLEASE SPECIFY- DISCO.......CASINO....OR BAR.\nTHE DRIVER TURNS AND ASKS               'WHERE TO MAC??'",
            7: "THE ELEVATOR DOORS OPEN....I GET IN.\nAS THE DOORS CLOSE MUSIC STARTS PLAYING-IT'S THE USUAL ELEVATOR STUFF...BORING!\nWE START TO MOVE.....AFTER A FEW SECONDSTHE ELEVATOR STOPS.\nTHE DOORS OPEN AND I GET OUT.",
            8: "SHE SAYS 'ME FIRST!!!!!\nSHE TAKES MY THROBBING TOOL INTO HER\nMOUTH!!!! SHE STARTS GOING TO WORK......FEELS SO GOOD!!!!!!\nTHEN SHE SMILES AS SHE BITES IT OFF!    SHE SAYS 'NO ORAL SEX IN THIS GAME!!!!!!SUFFER!!!!!!!'",
            9: "WELL MY SON....HERE'S MY STORY.         I CAME HERE MANY YEARS AGO-\nAND MY GOALS WERE THE SAME AS YOURS.....BUT THIS ADVENTURE WAS TOO MUCH FOR ME!\nHERE'S A GIFT.......CARRY IT WITH YOU   AT ALL TIMES!!!!!\nTHERE'S SOME KINKY GIRLS IN THIS TOWN!! AND YOU NEVER KNOW WHEN YOU MAY NEED TO USE THIS TO DEFEND YOURSELF!!!!!!!",
            10: "SHE'S WEARING A THE TIGHTEST JEANS!\nWOW.......WHAT A BODY!!!!! 36-24-35!!   THIS GIRLS DERRIERE IS SENSATIONAL!!\nAND THE SHIRT? SEE THROUGH- AND WHAT I  SEE I LIKE!\nAS MY EYES RELUCTANTLY ROAM FROM HER    BODY I SEE BRIGHT BLUE EYES- AND A SMILETHAT DAZZLES ME. I THINK SHE LIKES ME!",
            # Add other special texts as needed
        }
        
    def get_item_name(self, item_id):
        """Get the name of an item from its ID"""
        return self.object_names.get(item_id, f"UNKNOWN ITEM ({item_id})")
    
    def show_graffiti(self):
        """Show special graffiti screen"""
        # This would display the ASCII art from the original game
        print("*" * 50)
        print("AT MY APPLE IS WHERE I SIT,")
        print("WHEN I FEEL LIKE FONDLING IT'S BITS!")
        print()
        print("COMPUTER FREAKS PEEK BEFORE THEY POKE")
        print("I'D LIKE TO NIBBLE HER FLOPPIES!")
        print()
        print("ASCII, AND YE SHALL RECEIVE")
        print()
        print("THE PASSWORD IS:")
        print("BELLYBUTTON")
        print("*" * 50)
        input("HIT ANY KEY TO RETURN TO GAME")
        return ""

    def look_billboard(self):
        """Show the billboard description"""
        print("*" * 50)
        print("FOR THOSE WHO DESIRE THE BEST:")
        print()
        print("ANNOUNCING")
        print()
        print("THE MOST EXCLUSIVE,")
        print()
        print("THE EXCITING,")
        print()
        print("THE HOTTEST SPOT IN TOWN,")
        print()
        print("SWINGING SINGLE'S DISCO")
        print("*" * 50)
        input("HIT ANY KEY TO RETURN TO GAME")
        return ""

    def read_newspaper(self):
        """Display newspaper content"""
        return "THE NEWS!!!\nTODAY THE PRIME RATE WAS RAISED ONCE    AGAIN...TO 257%! THIS DOES NOT COME NEARTHE RECORD SET IN 1996- WHEN IT BROKE \nTHE 1000% MARK.........................\nTHE BIRTH RATE HAS TAKEN A DRAMATIC     FALL....THIS IS DUE TO THE INCREASED    USAGE OF COMPUTERS AS SEXUAL PARTNERS..\nHOWEVER....RAPES OF INNOCENT PEOPLE ARE ON THE INCREASE! AND WHO IS THE RAPIST??COMPUTERIZED BANKING MACHINES LEAD THE  LIST....FOLLOWED BY HOME COMPUTERS....."

    def read_magazine(self):
        """Display magazine content"""
        return "HMMMMM..... AN INTERESTING MAGAZINE WITH A NICE CENTERFOLD!\nTHE FEATURE ARTICLE IS ABOUT HOW TO PICK UP AN INNOCENT GIRL AT A DISCO.\nIT SAYS- 'SHOWER HER WITH PRESENTS. DANCING WON'T HURT EITHER.\nAND WINE IS ALWAYS GOOD TO GET THINGS MOVING!'"

    def hooker_look(self):
        """Look at the hooker"""
        return "OH NO!!!!! I PAID FOR THIS?!?!?\nTHIS BEAST IS REALLY UGLY!!!!\nJEEZZZZ.....I HOPE I DON'T GET THE CLAP FROM THIS HOOKER.....................\nWELL...SHE SEEMS TO BE ANNOYED THAT I HAVEN'T JUMPED ON HER YET....GO TO IT STUD!!!!!"

    def blonde_look(self):
        """Look at the blonde"""
        return "SHE'S WEARING THE TIGHTEST JEANS!\nWOW.......WHAT A BODY!!!!! 36-24-35!! THIS GIRLS DERRIERE IS SENSATIONAL!!\nAND THE SHIRT? SEE THROUGH- AND WHAT I SEE I LIKE!\nAS MY EYES RELUCTANTLY ROAM FROM HER BODY I SEE BRIGHT BLUE EYES- AND A SMILE THAT DAZZLES ME. I THINK SHE LIKES ME!"

    def peephole_look(self):
        """Look through the peephole"""
        return "HMMMM..... THIS IS A PEEPING TOMS PARADISE!!!!\nACROSS THE WAY IS ANOTHER HOTEL. AHAH! THE CURTAINS ARE OPEN AT ONE WINDOW!\nTHE BATHROOM DOOR OPENS AND A GIRL WALKS OUT. HOLY COW! HER BOOBS ARE HUGE- AND LOOK AT THE WAY THEY SWAY AS SHE STRIDES ACROSS THE ROOM!\nNOW SHE'S TAKING A LARGE SAUSAGE SHAPED OBJECT AND LOOKING AT IT LONGINGLY! DAMN! SHE SHUTS THE CURTAIN!"

    def tv_on_look(self):
        """What's on TV"""
        channels = [
            "A MASKED MAN RUNS ACROSS THE SCREEN.\nJUMPING UP HE LANDS ON HIS HORSE AND YELLS 'HI-HO PLUTONIUM!!!!!\nHE RIDES OFF INTO A GREEN SKY.......\nNOTHING LIKE A GOOD OLD WESTERN TO PASS THE TIME.......",
            "IT'S 'THE PRICE IS FRIGHT!!!!!!\n'AND NOW FOR OUR FAVORITE HOST..........HAUNTY MAULE!!!!!!!!!!\nHAUNTY JUMPS UP ON THE STAGE- HE ASKS 'AND WHO'S OUR FIRST LUCKY CONTESTANT?'\nTHE ANNOUNCER POINTS OUT A LADY...THE CROWD SCREAMS IN ECSTACY AS SHE'S DRAGGED TO THE STAGE............",
            "CAPTAIN JERK LOOKS AT THE DOOR FROM WHICH BEHIND THE NOISE IS COMING.\nTHROWING OPEN THE DOOR- HIS FACE TURNS A DEEP RED!!!!!!!!!\nHE SAYS 'SCOTTY! WHAT ARE YOU DOING?? SCOTTY REPLIES 'BUT CAPTAIN!?!? MY GIRL AND I- WE'RE ENGAGED!!!!\nJERK COMMANDS 'WELL THEN DISENGAGE!'....AS THE STARSHIP THRUSTED FORWARD........PENETRATING DEEPER INTO SPACE..........",
            "MR. RODJERKS JUMPS UP WITH HIS BIG SNEAKERS AND SAYS IN HIS CHEERY VOICE..\nGUESS WHAT- BOYS AND GIRLS?????? TODAY WE'RE GOING TO LEARN ABOUT SUCKERS!!\nSUSIE...SEE THE LOLLY-POP???? CAN YOU STICK IT IN YOUR MOUTH??? THAT'S RIGHT!\nTHAT'S A NICE LOLLY-POP....NICE AND HARD RIGHT?!?!?!?.................",
            "CABLE TV!!!!!!!!\nTHERE SHOWING THE KINKIEST X-RATED MOVIES!!!!!!! THIS ONE'S TITLED 'DEEP NOSTRIL'.\nTHE PIMP LIKES THIS ONE!!!!!!\nHE'S ENGROSSED IN THE ACTION HE SEES!!!! SEEMS DISTRACTED.................",
            "IT'S HAPPY DAZE!!!!!!!!\nRICHIE TURNS TO GONZY AND SAYS 'BUT YOU ALWAYS HAD IT MADE WITH THE GIRLS.......WHAT'S YOUR SECRET???'\nTHE GONZ SAYS 'AAYYYYYY....I DIDN'T GET MY NAME FOR NUTHIN!'\nREACHING INTO HIS POCKET HE PULLS OUT A FUNNY LOOKING CIGARETTE............",
            "MRS. SMITH AND MRS. JONES ARE COMPARING\nDETERGENTS.......SEE THIS BLOUSE? WE'RE MAKING IT THIS DIRTY TO SEE WHO'S WORKS BETTER.(A DOG IS THROWN ONTO THE BLOUSE. IN HIS EXCITEMENT HE DEFICATES ALL OVER IT......)\nDO YOU THINK YOURS WILL WORK- MRS. SMITH?? (THE CAMERA PANS TO MRS. SMITH. SHE THROWS UP.)\nMRS JONES????? (A SHOT SHOWS HER TAKING THE DOG AND...........)",
            "IT'S THE SUPER BOWL!!!!\nTHE CENTER SNAPS THE BALL! THE QUARTERBACK FADES BACK!!\nIT'S A BOMB!!!!!!! THE BALL SAILS THROUGH THE AIR....THE RECIEVER RUNS TO GET IT................\nIT EXPLODES IN HIS HANDS!!!! WHAT A BOMB!!!! TELL ME HOWARD- HAVE YOU EVER SEEN THIS BEFORE???"
        ]
        return random.choice(channels)

    def girl_look(self):
        """Look at the girl"""
        if self.girl_points > 3:
            return "SHE SLAPS ME AND YELLS 'PERVERT!!!!!'"
        return "CUTE AND INNOCENT! JUST THE WAY I LIKE MY WOMEN.\nOH- THIS GIRL IS GREAT! SHE HAS A BEAUTIFUL CALIFORNIA TAN....AND PERT LITTLE BREASTS...A TRIM WAIST......... AND WELL ROUNDED HIPS!!\nI DREAM ABOUT GETTING THIS NICE A GIRL."

    def girl_look_room26(self):
        """Look at the girl in the jacuzzi"""
        return "WHAT A BEAUTIFUL FACE!!! SHE'S LEANING BACK IN THE JACUZZI WITH HER EYES CLOSED AND SEEMS EXTREMELY RELAXED.\nTHE WATER IS BUBBLING UP AROUND HER....\nA '10'!! SHE'S SO BEAUTIFUL.............A GUY REALLY COULD FALL IN LOVE WITH\nA GIRL LIKE THIS. I PRESUME HER NAME IS 'EVE'....AT LEAST THATS WHAT THE TOWEL NEXT TO HER HAS EMBROIDERED ON IT."

    def plant_look(self):
        """Look at the plant"""
        if self.bushes_found == 0:
            self.bushes_found = 1
            return "THERE'S A GROUP OF BUSHES BEHIND IT!!"
        return "IT'S A NICE PLANT."

    def look_rubber(self):
        """Look at the rubber"""
        color = "RED" if hasattr(self, 'rubber_color') else ""
        flavor = "CHERRY" if hasattr(self, 'rubber_flavor') else ""
        lubricated = "LUBRICATED" if hasattr(self, 'rubber_lubricated') and self.rubber_lubricated else "NON-LUBRICATED"
        ribbed = "RIBBED" if hasattr(self, 'rubber_ribbed') and self.rubber_ribbed else "SMOOTH"
        
        if not color:
            return "IT'S A RUBBER."
        
        return f"IT'S {color}, {flavor}-FLAVORED, {lubricated}, AND {ribbed}"

    def display_room(self):
        """Display the current room and available objects"""
        print("\n" + "=" * 50)
        print(self.rooms[self.current_room]["desc"])
        
        # Show available directions
        directions = self.room_exits[self.current_room][1]
        if directions:
            print("\nOTHER AREAS ARE:", ", ".join(directions))
        else:
            print("\nTHERE ARE NO OBVIOUS EXITS.")
        
        # Show objects in the room
        objects = self.room_objects.get(self.current_room, [])
        if objects:
            print("\nITEMS IN SIGHT ARE:", end=" ")
            object_names = [self.get_item_name(obj_id) for obj_id in objects]
            print(", ".join(object_names))
        else:
            print("\nTHERE ARE NO ITEMS HERE.")
        
        print("=" * 50)

    def get_user_input(self):
        """Get and parse user input"""
        print()
        user_input = input("WHAT SHALL I DO? ").upper().strip()
        
        if not user_input:
            return None, None
        
        # Single character commands
        if user_input == "Q":
            confirmation = input("SAVE GAME?? (Y/N) ").upper()
            if confirmation == "Y":
                print("GAME SAVED!")
            print("GOODBYE!")
            sys.exit()
        
        if user_input == "N":
            return "GO", "NORTH"
        elif user_input == "S":
            return "GO", "SOUTH"
        elif user_input == "E":
            return "GO", "EAST"
        elif user_input == "W":
            return "GO", "WEST"
        elif user_input == "U":
            return "GO", "UP"
        elif user_input == "D":
            return "GO", "DOWN"
        elif user_input == "I":
            return "INVENTORY", None
        elif user_input == "SCORE":
            print(f"YOUR SCORE IS {self.score} OUT OF '3'")
            return None, None
        elif user_input == "SAVE GAME":
            print("GAME SAVED!")
            return None, None
        elif user_input == "LOOK":
            self.display_room()
            return None, None
            
        # Parse verb-noun commands
        words = user_input.split()
        if len(words) == 1:
            return words[0], None
        else:
            verb = words[0]
            noun = ' '.join(words[1:])
            return verb, noun

    def process_command(self, verb, noun):
        """Process the user's command"""
        # Debug
        # print(f"DEBUG: Verb={verb}, Noun={noun}")
        
        if verb is None:
            return
            
        # Handle movement
        if verb == "GO":
            self.move_to(noun)
            return
            
        # Handle inventory
        if verb == "INVENTORY" or verb == "I":
            self.show_inventory()
            return
            
        # Handle looking at objects
        if verb in ["LOOK", "EXAMINE", "READ", "SEARCH"]:
            self.look_at(noun)
            return
            
        # Handle taking objects
        if verb in ["TAKE", "GET", "GRAB"]:
            self.take_object(noun)
            return
            
        # Handle dropping objects
        if verb in ["DROP", "LEAVE", "PLACE", "GIVE"]:
            self.drop_object(noun)
            return
            
        # Handle opening things
        if verb in ["OPEN", "PULL"]:
            self.open_object(noun)
            return
            
        # Handle buying things
        if verb in ["BUY", "ORDER"]:
            self.buy_object(noun)
            return
            
        # Handle using objects
        if verb in ["USE", "WEAR"]:
            self.use_object(noun)
            return
            
        # Handle TV commands
        if verb == "TV":
            if noun == "ON":
                self.tv_power("ON")
            elif noun == "OFF":
                self.tv_power("OFF")
            return
            
        # Handle playing games
        if verb == "PLAY":
            if noun == "SLOTS":
                self.play_slots()
            elif noun == "21":
                self.play_blackjack()
            else:
                print("PLAYFUL BUGGER, EH??")
            return
            
        # Handle pushing
        if verb in ["PUSH", "PRESS"]:
            self.push_object(noun)
            return
            
        # Handle special actions based on the combination
        if verb == "FUCK" or verb == "SEDUCE" or verb == "RAPE" or verb == "SCREW":
            self.seduce_object(noun)
            return
            
        if verb == "CLIMB":
            self.climb_object(noun)
            return
            
        if verb == "WATER":
            if noun == "ON":
                self.water_control("ON")
            elif noun == "OFF":
                self.water_control("OFF")
            return
            
        if verb == "FILL":
            self.fill_object(noun)
            return
            
        if verb == "JUMP":
            self.jump()
            return
            
        # Add more verb handlers as needed
        
        # Default response
        print(f"I DON'T KNOW HOW TO {verb} SOMETHING!")

    def move_to(self, direction):
        """Handle movement between rooms"""
        if self.tied_to_bed:
            print("BUT I'M TIED TO THE BED!!!!!")
            return
            
        if not direction:
            print("WHICH DIRECTION?")
            return
            
        # Get available directions for the current room
        available_dirs = self.room_exits[self.current_room][1]
        
        # Check if the direction is valid
        if direction not in available_dirs:
            print("I CAN'T GO IN THAT DIRECTION!!")
            return
            
        # Special case for room 9
        if self.current_room == 9 and self.score == 0:
            print("THE HOOKER SAYS 'DON'T GO THERE....DO ME FIRST!!!!'")
            return
            
        # Special case for room 17 (locked door)
        if self.current_room == 17 and direction == "SOUTH" and self.girl_points < 5:
            print("THE DOOR IS LOCKED SHUT!")
            return
            
        # Special case for room 23 (disco door)
        if self.current_room == 23 and direction == "WEST" and self.door_unlocked == 0:
            print("THE DOOR IS CLOSED!")
            return
            
        # Special case for room 5 (pimp room)
        if self.current_room == 5 and direction == "UP":
            if self.score == 0:
                if self.money < 10:
                    print("THE PIMP SAYS I CAN'T UNTIL I GET $1000")
                    return
                self.money -= 10
                print("THE PIMP TAKES $1000 AND SAYS OK")
            else:
                if self.blonde_girl_drugged == 0:
                    print("THE PIMP SAYS 'NO WAY!!!! LEAVE MY GIRL ALONE!")
                    return
                    
        # Calculate the new room
        new_room = self.current_room
        if direction == "NORTH":
            new_room += 1
        elif direction == "SOUTH":
            new_room -= 1
        elif direction == "EAST":
            new_room += 2
        elif direction == "WEST":
            new_room -= 2
        elif direction == "UP":
            new_room += 4
        elif direction == "DOWN":
            new_room -= 4
        
        # Special case for room 10 and using rope
        if self.current_room == 10 and direction == "WEST":
            if self.using_rope != 1:
                print("AAAAAEEEEEIIIIIIII!!!!!!!!!")
                print("SPLAAATTTTT!!!!!")
                print("I SHOULD HAVE USED SAFETY ROPE!!!!!!!!")
                self.game_over()
                return
        
        # Update the current room
        self.current_room = new_room
        
        # Turn off using_rope if going down from a balcony
        if direction == "DOWN" and self.using_rope == 1:
            self.using_rope = 0
            
        # Display the new room
        self.display_room()

    def show_inventory(self):
        """Show the player's inventory"""
        if not self.inventory:
            print("I'M CARRYING NOTHING!!")
            return
            
        print("I'M CARRYING THE FOLLOWING:")
        for item_id in self.inventory:
            print(f"- {self.get_item_name(item_id)}")

    def look_at(self, noun):
        """Handle looking at objects"""
        if not noun:
            self.display_room()
            return
            
        # Convert noun to object ID
        object_id = self.get_object_id(noun)
        
        if not object_id:
            print("I DON'T SEE THAT HERE!!")
            return
            
        # Check if the object is in the room or inventory
        if object_id not in self.room_objects.get(self.current_room, []) and object_id not in self.inventory:
            print("IT'S NOT HERE!!!!!")
            return
            
        # Get the look message for the object
        message = self.object_look_messages.get(object_id)
        
        if not message:
            print("I SEE NOTHING SPECIAL")
            return
            
        # Some look messages are functions to handle special cases
        if callable(message):
            result = message()
            if result:
                print(result)
        else:
            print(message)
            
        # Special handling for hidden objects
        if object_id == 8 and self.drawer_opened == 1 and self.drawer_examined == 0:
            print("I SEE SOMETHING!!")
            self.drawer_examined = 2
            self.add_to_room(50)  # Add newspaper
        elif object_id == 9 and self.toilet_examined == 0:
            print("I SEE SOMETHING!!")
            self.toilet_examined = 1
            self.add_to_room(51)  # Add wedding ring
        elif object_id == 24 and self.ashtray_examined == 0:
            print("I SEE SOMETHING!!")
            self.ashtray_examined = 1
            self.add_to_room(64)  # Add passcard
        elif object_id == 29 and self.magazine_found == 0:
            print("I SEE SOMETHING!!")
            self.magazine_found = 1
            self.add_to_room(68)  # Add magazine
        elif object_id == 42 and self.stool_used == 1 and self.cabinet_opened == 1:
            print("I SEE SOMETHING!!")
            self.cabinet_opened = 2
            self.add_to_room(76)  # Add pitcher
        elif object_id == 45:
            print("I SEE SOMETHING!!")
            self.add_to_room(75)  # Add apple
        elif object_id == 56 and self.dumpster_checked == 0:
            print("I SEE SOMETHING!!")
            self.dumpster_checked = 1
            self.add_to_room(58)  # Add apple core
        elif object_id == 58 and self.apple_core == 0:
            print("I SEE SOMETHING!!")
            self.apple_core = 1
            self.add_to_room(59)  # Add seeds

    def add_to_room(self, item_id):
        """Add an item to the current room"""
        if item_id not in self.room_objects.get(self.current_room, []):
            if self.current_room not in self.room_objects:
                self.room_objects[self.current_room] = []
            self.room_objects[self.current_room].append(item_id)

    def get_object_id(self, noun):
        """Convert a noun to an object ID"""
        noun = noun.upper()
        
        # Simple matching by the first 4 characters
        noun_prefix = noun[:4] if len(noun) >= 4 else noun
        
        for obj_id, name in self.object_names.items():
            if noun_prefix in name.upper():
                return obj_id
                
        return None

    def take_object(self, noun):
        """Take an object from the room"""
        if not noun:
            print("TAKE WHAT?")
            return
            
        # Special case for inventory
        if noun.upper() in ["INVENTORY", "INVE"]:
            self.show_inventory()
            return
            
        # Convert noun to object ID
        object_id = self.get_object_id(noun)
        
        if not object_id:
            print("I DON'T SEE THAT HERE!!")
            return
            
        # Check if the object is in the room
        if object_id not in self.room_objects.get(self.current_room, []):
            print("I DON'T SEE IT HERE!!")
            return
            
        # Check if we can take this object (some might be fixed in place)
        if object_id < 50:
            print("I CAN'T DO THAT")
            return
            
        # Check if we're in the pharmacy and trying to steal
        if self.current_room == 24 and (object_id == 69 or object_id == 68):
            print("THE MAN SAYS SHOPLIFTER!! AND SHOOTS ME")
            self.game_over()
            return
            
        # Check if we're carrying too much
        if len(self.inventory) >= 8:
            print("I'M CARRYING TOO MUCH!!!")
            return
            
        # Remove the object from the room and add to inventory
        self.room_objects[self.current_room].remove(object_id)
        self.inventory.append(object_id)
        
        print("OK")
        
        # Update the display
        self.display_room()

    def drop_object(self, noun):
        """Drop an object from inventory"""
        if not noun:
            print("DROP WHAT?")
            return
            
        # Convert noun to object ID
        object_id = self.get_object_id(noun)
        
        if not object_id:
            print("I DON'T HAVE THAT!!")
            return
            
        # Check if the object is in inventory
        if object_id not in self.inventory:
            print("I DON'T HAVE IT!!")
            return
            
        # Remove from inventory and add to the room
        self.inventory.remove(object_id)
        
        if self.current_room not in self.room_objects:
            self.room_objects[self.current_room] = []
        self.room_objects[self.current_room].append(object_id)
        
        print("OK")
        
        # Special checks for giving items to characters
        if self.current_room == 21:  # In the disco
            if object_id == 60:  # Candy
                if self.candy_given == 0 and self.girl_points < 3:
                    self.girl_points += 1
                    self.candy_given = 1
                    print("SHE SMILES AND EATS A COUPLE!!")
            elif object_id == 57:  # Flowers
                if self.girl_points < 3:
                    self.girl_points += 1
                    print("SHE BLUSHES PROFUSELY AND PUTS THEM IN HER HAIR!")
            elif object_id == 51:  # Wedding ring
                if self.girl_points < 3:
                    self.girl_points += 1
                    print("SHE BLUSHES AND PUTS IT IN HER PURSE.")
                    
            # Check if we've given all the gifts
            if self.girl_points == 3:
                print("SHE SAYS 'SEE YOU AT THE MARRIAGE CENTER!!")
                self.girl_points = 4
                # Move the girl to the marriage center
                self.remove_from_room(21, 49)
                self.add_to_room_by_id(12, 49)  # Add girl to marriage center
        
        elif self.current_room == 22 and object_id == 72:  # Giving wine to bum
            if self.wine_given == 0:
                print("HE LOOKS AT ME AND STARTS TO SPEAK...")
                print("AFTER ALL YOU MAY GET IN A PROGRAM BUG")
                print("LIKE I DID!!!")
                print("HE THROWS UP AND GIVES ME BACK THE WINE")
                self.wine_given = 1
                # Add a knife to the room
                self.add_to_room(66)
                
        elif self.current_room == 26 and object_id == 75:  # Giving apple to girl in jacuzzi
            print("SHE TAKES THE APPLE AND RAISES IT TO HER MOUTH. WITH AN OUTRAGEOUSLY INNOCENT LOOK SHE TAKES A SMALL BITE OUT OF IT.")
            print("A SMILE COMES ACROSS HER FACE! SHE'S REALLY STARTING TO LOOK QUITE SEXY!!!!")
            print("SHE WINKS AND LAYS BACK INTO THE JACUZZI")
            self.jacuzzi_apple = 1
            
        elif self.current_room == 19 and object_id == 61 and self.blonde_girl_drugged == 0:  # Giving pills to blonde
            print("THE BLONDE LOOKS AT THE PILLS AND SAYS 'THANKS!!! I LOVE THIS STUFF!'")
            print("SHE TAKES A PILL..........HER NIPPLES START TO STAND UP! WOW!!!!")
            print("SHE'S BREATHING HEAVILY....I HOPE SHE RAPES ME!!!!!")
            print("SHE SAYS 'SO LONG!!! I'M GOING TO GO SEE MY BOYFRIEND!' SHE DISAPPEARS DOWN THE STAIRS........")
            self.blonde_girl_drugged = 1
            # Remove blonde from the room
            self.remove_from_room(19, 25)
            
        elif self.current_room == 1 and object_id == 52:  # Giving whiskey to guy in hallway
            print("THE GUY GIVES ME A TV CONTROLLER!!")
            self.remove_from_inventory(52)
            self.add_to_room(84)  # Add TV remote
            
        # Update the display
        self.display_room()

    def remove_from_room(self, room_id, item_id):
        """Remove an item from a room"""
        if room_id in self.room_objects and item_id in self.room_objects[room_id]:
            self.room_objects[room_id].remove(item_id)

    def add_to_room_by_id(self, room_id, item_id):
        """Add an item to a specific room"""
        if room_id not in self.room_objects:
            self.room_objects[room_id] = []
        if item_id not in self.room_objects[room_id]:
            self.room_objects[room_id].append(item_id)

    def remove_from_inventory(self, item_id):
        """Remove an item from inventory"""
        if item_id in self.inventory:
            self.inventory.remove(item_id)

    def open_object(self, noun):
        """Open an object"""
        if not noun:
            print("OPEN WHAT?")
            return
            
        # Convert noun to object ID
        object_id = self.get_object_id(noun)
        
        if not object_id:
            print("I DON'T SEE THAT HERE!!")
            return
            
        # Check if the object is in the room or inventory
        if object_id not in self.room_objects.get(self.current_room, []) and object_id not in self.inventory:
            print("IT'S NOT HERE!!!!!")
            return
            
        # Handle specific objects
        if object_id == 8:  # Desk drawer
            if self.current_room != 1:
                print("NOT YET, BUT MAYBE LATER................")
                return
            print("OK")
            self.drawer_opened = 1
            return
            
        elif object_id == 30:  # Door to disco
            if self.current_room != 23:
                print("NOT YET, BUT MAYBE LATER................")
                return
                
            # Check for passcard
            if 64 not in self.inventory:
                print("A VOICE ASKS 'PASSCARD??' I SEARCH IN MY POCKETS AND...")
                print("I DON'T HAVE IT!")
                return
                
            print("A VOICE ASKS 'PASSCARD??' I SEARCH IN MY POCKETS AND...")
            print("I HAVE IT! THE DOOR OPENS!")
            self.door_unlocked = 1
            self.room_exits[23][0] = 15  # Change exit type to allow west
            return
            
        elif object_id == 35:  # Closet
            if self.current_room != 29:
                print("NOT YET, BUT MAYBE LATER................")
                return
                
            print("OK")
            self.closet_opened = 1
            return
            
        elif object_id == 42:  # Cabinet
            if self.stool_used == 0:
                print("I CAN'T REACH IT!!")
            else:
                print("IT'S ALREADY OPEN!")
            return
            
        elif object_id == 46:  # Window
            print("WON'T BUDGE")
            return
            
        print("UMMM..........................HUH??")

    def tv_power(self, state):
        """Turn the TV on or off"""
        if self.current_room != 5:
            print("NO TV!")
            return
            
        if 84 not in self.inventory:
            print("I NEED THE REMOTE CONTROL UNIT!")
            return
            
        if state == "OFF":
            self.tv_on = 0
            print("OK")
            return
            
        if state == "ON":
            if self.score == 0:
                print("THE DUDE WON'T LET ME!!")
                return
                
            self.tv_on = 1
            self.tv_on_look()
            
            # Ask user if they want to change channel
            while True:
                channel = input("CHOOSE A CHANNEL (1-9): ")
                try:
                    channel = int(channel)
                    if 1 <= channel <= 9:
                        break
                    else:
                        print("HUH?")
                except ValueError:
                    print("HUH?")
            
            # Special case for channel 6 - distracts the pimp
            if channel == 6:
                self.blonde_girl_drugged = 1
                
            # Show TV content
            self.tv_on_look()
            
            # Ask if they want to change channel again
            change = input("CHANGE THE CHANNEL? (Y/N): ").upper()
            if change == "Y":
                self.tv_power("ON")
            
            return

    def play_slots(self):
        """Play slot machines"""
        if self.current_room != 13:
            print("OK, SHOW ME YOUR SLOT.....")
            return
            
        print("THIS WILL COST $100 EACH TIME")
        print(f"YOU HAVE ${self.money}00")
        
        play = input("WOULD YOU LIKE TO PLAY? (Y/N): ").upper()
        if play != "Y":
            return
            
        while True:
            # Generate random slot machine symbols
            symbol1 = chr(random.randint(33, 43))
            symbol2 = chr(random.randint(33, 43))
            symbol3 = chr(random.randint(33, 43))
            
            print(f"{symbol1}  {symbol2}  {symbol3}")
            
            # Check for wins
            if symbol1 == symbol2 and symbol2 == symbol3:
                print("TRIPLES!!!!!! YOU WIN $1500")
                self.money += 15
            elif symbol1 == symbol2 or symbol2 == symbol3 or symbol1 == symbol3:
                print("A PAIR! YOU WIN $300")
                self.money += 3
            else:
                self.money -= 1
                if self.money < 1:
                    print("I'M BROKE!!!- THAT MEANS DEATH!!!!!!!!")
                    self.game_over()
                    return
                print("YOU LOSE!")
            
            print(f"YOU HAVE ${self.money}00")
            play_again = input("WOULD YOU LIKE TO PLAY? (Y/N): ").upper()
            if play_again != "Y":
                break

    def play_blackjack(self):
        """Play blackjack"""
        if self.current_room != 14:
            print("NOT YET, BUT MAYBE LATER................")
            return
            
        print(f"YOU HAVE ${self.money}00")
        
        # Get bet amount
        while True:
            try:
                bet = int(input("HOW MANY DOLLARS WOULD YOU LIKE TO BET? "))
                if bet > self.money * 100:
                    print("YOU DON'T HAVE THAT MUCH!!!")
                elif bet % 100 != 0:
                    print("$100 INCREMENTS ONLY!!")
                else:
                    bet = bet // 100
                    break
            except ValueError:
                print("$100 INCREMENTS (NUMERIC) ONLY!!")
                
        print("OK")
        
        # Initialize game state
        player_total = 0
        dealer_total = 0
        player_aces = 0
        dealer_aces = 0
        
        # Deal initial cards
        for i in range(1, 5):
            card_value, card_name, is_ace = self.deal_card()
            
            if i == 1 or i == 3:  # Player's cards
                print(f"YOU'RE DEALT A{card_name}")
                player_total += card_value
                if is_ace:
                    player_aces += 1
            else:  # Dealer's cards
                if i == 2:
                    print("THE DEALER GETS A CARD DOWN")
                else:
                    print(f"THE DEALER GETS A{card_name}")
                dealer_total += card_value
                if is_ace:
                    dealer_aces += 1
        
        # Adjust for aces if needed
        while player_total > 21 and player_aces > 0:
            player_aces -= 1
            player_total -= 10
        
        # Show player's total
        print(f"YOUR TOTAL IS {player_total}")
        
        # Check for blackjack
        if player_total == 21 and player_aces == 1:
            print("YOU'VE GOT ***BLACKJACK***")
            self.money += bet * 5
            print(f"YOU HAVE ${self.money}00")
            return
            
        if dealer_total == 21 and dealer_aces == 1:
            print("THE DEALER HAS ***BLACKJACK***")
            self.money -= bet
            print(f"YOU HAVE ${self.money}00")
            return
        
        # Player's turn
        while player_total < 21:
            hit = input("WOULD YOU LIKE A HIT (Y/N)?? ").upper()
            if hit != "Y":
                break
                
            card_value, card_name, is_ace = self.deal_card()
            print(f"YOU GET A{card_name}")
            player_total += card_value
            if is_ace:
                player_aces += 1
                
            # Adjust for aces if needed
            while player_total > 21 and player_aces > 0:
                player_aces -= 1
                player_total -= 10
                
            print(f"YOUR TOTAL IS {player_total}")
            
            if player_total > 21:
                print("BUSTED!")
                self.money -= bet
                print(f"YOU HAVE ${self.money}00")
                
                if self.money == 0:
                    print("YOU'RE OUT OF MONEY!!")
                    print("SO LONG!!!!!!!!!!")
                    self.game_over()
                    return
                    
                play_again = input("PLAY AGAIN?? (Y/N)?? ").upper()
                if play_again == "Y":
                    self.play_blackjack()
                return
        
        # Dealer's turn
        while dealer_total < 17:
            card_value, card_name, is_ace = self.deal_card()
            print(f"THE DEALER GETS A{card_name}")
            dealer_total += card_value
            if is_ace:
                dealer_aces += 1
                
            # Adjust for aces if needed
            while dealer_total > 21 and dealer_aces > 0:
                dealer_aces -= 1
                dealer_total -= 10
        
        print(f"THE DEALER HAS {dealer_total}")
        
        # Determine winner
        if dealer_total > 21:
            print("YOU WIN!!")
            self.money += bet
        elif player_total < dealer_total:
            print("YOU LOSE!")
            self.money -= bet
        elif player_total == dealer_total:
            print("TIE!")
        else:
            print("YOU WIN!!")
            self.money += bet
            
        print(f"YOU HAVE ${self.money}00")
        
        if self.money == 0:
            print("YOU'RE OUT OF MONEY!!")
            print("SO LONG!!!!!!!!!!")
            self.game_over()
            return
            
        play_again = input("PLAY AGAIN?? (Y/N)?? ").upper()
        if play_again == "Y":
            self.play_blackjack()

    def deal_card(self):
        """Deal a card for blackjack"""
        card_value = random.randint(1, 13)
        is_ace = False
        
        if card_value == 1:
            card_name = "N ACE"
            card_value = 11
            is_ace = True
        elif card_value == 11:
            card_name = " JACK"
            card_value = 10
        elif card_value == 12:
            card_name = " QUEEN"
            card_value = 10
        elif card_value == 13:
            card_name = " KING"
            card_value = 10
        elif card_value == 10:
            card_name = " 10"
        else:
            card_name = " " + str(card_value)
            
        return card_value, card_name, is_ace

    def push_object(self, noun):
        """Push an object"""
        if not noun:
            print("PUSH WHAT?")
            return
            
        # Convert noun to object ID
        object_id = self.get_object_id(noun)
        
        if not object_id:
            print("I DON'T SEE THAT HERE!!")
            return
            
        # Handle specific objects
        if object_id == 14 and self.current_room == 3:  # Button in bar
            print("A VOICE ASKS 'WHATS THE PASSWORD?' (ONE WORD)")
            password = input().upper()
            
            if password.startswith("BELL"):
                print("THE CURTAIN PULLS BACK!!")
                self.room_exits[3][0] = 4  # Change exit type to allow east
            else:
                print("WRONG!")
            return
            
        elif object_id == 14 and self.current_room == 19:  # Button in hotel
            if self.blonde_girl_drugged == 0:
                print("THE BLONDE SAYS 'YOU CAN'T GO THERE!'")
                return
                
            print("THE ELEVATOR DOORS OPEN....I GET IN.\nAS THE DOORS CLOSE MUSIC STARTS PLAYING-IT'S THE USUAL ELEVATOR STUFF...BORING!\nWE START TO MOVE.....AFTER A FEW SECONDS THE ELEVATOR STOPS.\nTHE DOORS OPEN AND I GET OUT.")
            self.current_room = 25
            self.display_room()
            return
            
        elif object_id == 14 and self.current_room == 25:  # Button in penthouse
            print("THE ELEVATOR DOORS OPEN....I GET IN.\nAS THE DOORS CLOSE MUSIC STARTS PLAYING-IT'S THE USUAL ELEVATOR STUFF...BORING!\nWE START TO MOVE.....AFTER A FEW SECONDS THE ELEVATOR STOPS.\nTHE DOORS OPEN AND I GET OUT.")
            self.current_room = 19
            self.display_room()
            return
            
        elif object_id == 44 and self.current_room == 15 and self.bushes_found == 1:
            self.current_room = 28
            self.display_room()
            return
            
        elif object_id == 46 and self.current_room == 8:
            self.move_to("SOUTH")
            return
            
        elif object_id == 49:  # Girl
            print("SHE KICKS ME IN THE STOMACH AND LAUGHS!!")
            return
            
        print("PUSHY CHUMP, EH???")

    def seduce_object(self, noun):
        """Seduce an object/character"""
        if noun.upper() == "YOU":
            print("NOT TONIGHT- I HAVE A HEADACHE!")
            return
            
        # Convert noun to object ID
        object_id = self.get_object_id(noun)
        
        if not object_id:
            print("I DON'T SEE THAT HERE!!")
            return
            
        # Handle specific objects
        if object_id == 17 and self.current_room == 9:  # Hooker
            if self.hooker_done:
                print("SHE CAN'T TAKE IT ANY MORE!!!!!")
                return
                
            if not self.wearing_rubber:
                print("OH NO!!!! I'VE GOT THE DREADED ATOMIC CLAP!!! I'M DEAD!!")
                self.game_over()
                return
                
            print("SHE SAYS 'ME FIRST!!!!!\nSHE TAKES MY THROBBING TOOL INTO HER\nMOUTH!!!! SHE STARTS GOING TO WORK......FEELS SO GOOD!!!!!!\nTHEN SHE SMILES AS SHE BITES IT OFF! SHE SAYS 'NO ORAL SEX IN THIS GAME!!!!!! SUFFER!!!!!!!'")
            self.score = 1
            self.hooker_done = True
            return
            
        elif object_id == 74:  # Inflatable doll
            if self.id_inflated == 0:
                print("INFLATE IT FIRST- STUPID!!!")
                return
                
            if self.id_inflated == 1:
                print("OH BOY!!!!!- IT'S GOT 3 SPOTS TO TRY!!!\nI THRUST INTO THE DOLL- KINKY....EH???\nI START TO INCREASE MY TEMPO...FASTER AND FASTER I GO!!!!\nSUDDENLY THERE'S A FLATULENT NOISE AND THE DOLL BECOMES A POPPED BALLOON SOARING AROUND THE ROOM! IT FLIES OUT OF THE ROOM AND DISAPPEARS!")
                self.id_inflated = 2
                
                # Remove doll from inventory if it's there
                if 74 in self.inventory:
                    self.inventory.remove(74)
                # Or remove from room if it's there
                elif self.current_room in self.room_objects and 74 in self.room_objects[self.current_room]:
                    self.room_objects[self.current_room].remove(74)
                    
                return
                
        elif object_id == 49:  # Girl
            if self.current_room == 26:  # Girl in jacuzzi
                if not self.jacuzzi_apple:
                    print("NOT YET, BUT MAYBE LATER................")
                    return
                    
                print("SHE HOPS OUT OF THE TUB- THE STEAM RISING FROM HER SKIN.......HER BODY IS\nTHE BEST LOOKING I'VE EVER SEEN!!!\nTHEN SHE COMES UP TO ME AND GIVES THE BEST TIME OF MY LIFE!!!\nWELL......I GUESS THAT'S IT! AS YOUR PUPPET IN THIS GAME I THANK YOU FOR THE PLEASURE YOU HAVE BROUGHT ME.... SO LONG......I'VE GOT TO GET BACK TO MY NEW GIRL HERE! KEEP IT UP!")
                self.score = 3
                print(f"YOUR SCORE IS {self.score} OUT OF '3'")
                sys.exit()  # Game complete!
                
            elif self.girl_points >= 5 and self.current_room == 16:  # Girl in honeymoon suite
                if self.girl_points != 6:
                    print("SHE SAYS 'GET ME WINE!!! I'M NERVOUS!!'")
                    return
                    
                print("SHE SAYS 'LAY DOWN HONEY- LET ME GIVE YOU A SPECIAL SUPRISE!!\nI LAY DOWN AND SHE SAYS 'OK- NOW CLOSE YOUR EYES'. I CLOSE MY EYES AND SHE SHE STARTS TO GO TO WORK ON ME.........\nI'M REALLY ENJOYING MYSELF WHEN SUDDENLY SHE TIES ME TO THE BED!!!! THEN SHE SAYS 'SO LONG- TURKEY!' AND RUNS OUT OF THE ROOM!!!")
                print("WELL- THE SCORE IS NOW '2' OUT OF A POSSIBLE '3'.........BUT I'M ALSO TIED TO THE BED AND CAN'T MOVE.")
                self.score = 2
                self.tied_to_bed = True
                
                # Add rope to the room for the player to potentially cut later
                self.add_to_room(81)
                return
                
        elif object_id == 32:  # Waitress
            print("SHE KICKS ME IN THE GROIN AND SAYS 'WISE UP- BUSTER!!'")
            return
            
        elif object_id == 25:  # Blonde
            print("SHE SAYS 'I'M WORKING! LEAVE ME ALONE!'")
            return
            
        elif object_id == 16:  # Pimp
            print("HE SAYS 'YOU'LL NEVER HAVE ENOUGH MONEY FOR ME- FOOL!!!' I GUESS HE'S GAY!")
            return
            
        elif object_id == 27:  # Bum
            print("TO DO THAT I NEED VASELINE!!")
            return
            
        elif object_id == 15:  # Bartender
            print("HE JUMPS OVER THE BAR AND KILLS ME!!")
            self.game_over()
            return
            
        elif object_id == 13:  # Businessman
            print("NO WAY!!! YOU'RE WIERD!!")
            return
            
        print("PERVERT!")

    def climb_object(self, noun):
        """Climb an object"""
        if not noun:
            print("CLIMB WHAT?")
            return
            
        # Convert noun to object ID
        object_id = self.get_object_id(noun)
        
        if not object_id:
            print("I DON'T SEE THAT HERE!!")
            return
            
        # Handle specific objects
        if object_id == 77:  # Stool
            if self.current_room != self.get_room_with_object(77):
                print("IT'S NOT ON THE FLOOR HERE!")
                return
                
            print("OK")
            self.stool_used = 1
            return
            
        print("IT'S NOT ON THE FLOOR HERE!")

    def get_room_with_object(self, object_id):
        """Find the room containing a specific object"""
        for room_id, objects in self.room_objects.items():
            if object_id in objects:
                return room_id
        return None

    def water_control(self, state):
        """Control water (on/off)"""
        if self.current_room != 27:
            print("FIND A WORKING SINK")
            return
            
        if state == "ON":
            print("OK")
            self.water_on = 1
        elif state == "OFF":
            print("OK")
            self.water_on = 0

    def fill_object(self, noun):
        """Fill an object (like pitcher)"""
        if not noun:
            print("FILL WHAT?")
            return
            
        # Check for pitcher in inventory
        if 76 not in self.inventory:
            print("GET ME THE PITCHER SO I DON'T SPILL IT!")
            return
            
        # Check if at sink with water running
        if self.current_room != 27 or self.water_on != 1:
            print("NO WATER!!!")
            return
            
        print("OK")
        self.pitcher_full = 1

    def use_object(self, noun):
        """Use or wear an object"""
        if not noun:
            print("USE WHAT?")
            return
            
        # Convert noun to object ID
        object_id = self.get_object_id(noun)
        
        if not object_id:
            print("I DON'T SEE THAT HERE!!")
            return
            
        # Check if the object is in inventory
        if object_id not in self.inventory:
            print("I DON'T HAVE IT!!")
            return
            
        # Handle specific objects
        if object_id == 69:  # Rubber
            self.wearing_rubber = 1
            print("IT TICKLES!!!!")
            return
            
        elif object_id == 12:  # Toilet
            print("...........I GOT THOSE CONSTIPATION BLUES..............................")
            print("AHHH...RELIEF! THANKS!")
            return
            
        elif object_id == 26:  # Bed
            print("AHHHHH........SLEEP!!!")
            print("YOUR DISK IS SNORING!!! I CAN'T SLEEP!")
            return
            
        elif object_id == 81:  # Rope
            if self.current_room != 7 and self.current_room != 10:
                print("NOT YET, BUT MAYBE LATER................")
                return
                
            self.using_rope = 1
            print("OK")
            return
            
        elif object_id == 64:  # Passcard
            if self.current_room == 23:
                self.open_object("DOOR")
                return
            else:
                print("I DON'T SEE A PLACE TO USE IT HERE.")
                return
                
        elif object_id == 66:  # Knife
            if self.current_room == 16 and self.tied_to_bed:
                print("I DO AND IT WORKED! THANKS!")
                self.tied_to_bed = False
                return
            print("TRY GIVING IT TO HER")
            return
            
        elif object_id == 54:  # Bag
            print("TRY GIVING IT TO HER")
            return
            
        print("I DON'T KNOW HOW TO USE THAT.")

    def buy_object(self, noun):
        """Buy an object"""
        if not noun:
            print("BUY WHAT?")
            return
            
        # Check if we have enough money
        if self.money < 1:
            print("NO MONEY!!!")
            return
            
        # Convert noun to object ID
        object_id = self.get_object_id(noun)
        
        if not object_id:
            print("I DON'T SEE THAT HERE!!")
            return
            
        # Handle specific objects
        if (object_id == 52 or object_id == 53) and self.current_room == 3:  # Buying drinks at bar
            if (object_id == 52 and self.whiskey_bought) or (object_id == 53 and self.beer_bought):
                print("SORRY...TEMPORARILY SOLD OUT")
                return
                
            print("I GIVE THE BARTENDER $100 AND HE PLACES IT ON THE BAR.")
            self.money -= 1
            
            if object_id == 52:
                self.whiskey_bought = True
            else:
                self.beer_bought = True
                
            # Add the item to the room
            self.add_to_room(object_id)
            return
            
        elif object_id == 72 and self.current_room == 21:  # Buying wine at disco
            if self.wine_bottle:
                print("SORRY....ALL OUT!")
                return
                
            print("THE WAITRESS TAKES $100 AND SAYS SHE'LL RETURN")
            time.sleep(2)
            print("POOR SERVICE!")
            time.sleep(1)
            
            self.money -= 1
            self.wine_bottle = True
            
            # Add wine to the room
            self.add_to_room(72)
            return
            
        elif object_id == 69 and self.current_room == 24:  # Buying rubber at pharmacy
            if hasattr(self, 'rubber_color'):
                print("ALL OUT!!")
                return
                
            print("THE MAN LEANS OVER THE COUNTER AND WHISPERS:")
            self.rubber_color = input("WHAT COLOR? ").upper()
            self.rubber_flavor = input("AND FOR A FLAVOR?? ").upper()
            
            lubricated = input("LUBRICATED OR NOT (Y/N)?? ").upper()
            self.rubber_lubricated = lubricated == "Y"
            
            ribbed = input("RIBBED (Y/N)? ").upper()
            self.rubber_ribbed = ribbed == "Y"
            
            print(f"HE YELLS- THIS PERVERT JUST BOUGHT A {self.rubber_color}, {self.rubber_flavor}-FLAVORED")
            print(f"{'LUBRICATED' if self.rubber_lubricated else 'NON-LUBRICATED'}, {'RIBBED' if self.rubber_ribbed else 'SMOOTH'} RUBBER!!!!!")
            print()
            print("A LADY WALKS BY AND LOOKS AT ME IN DISGUST!!!!")
            
            self.money -= 1
            
            # Add rubber to inventory
            self.inventory.append(69)
            return
            
        elif object_id == 68:  # Magazine
            if self.current_room != self.get_room_with_object(68):
                print("NOT YET, BUT MAYBE LATER................")
                return
                
            print("HE TAKES $100 AND GIVES ME THE MAGAZINE")
            self.money -= 1
            
            # Remove magazine from room
            self.remove_from_room(self.current_room, 68)
            
            # Add magazine to inventory
            self.inventory.append(68)
            return
            
        print("NOT YET, BUT MAYBE LATER................")

    def jump(self):
        """Jump (mostly for jumping off ledges)"""
        if self.current_room != 8:
            print("WHOOOPEEEEE!!!")
            return
            
        print("AAAAAEEEEEIIIIIIII!!!!!!!!!")
        print("SPLAAATTTTT!!!!!")
        
        if self.current_room == 10 and self.using_rope == 0:
            print("I SHOULD HAVE USED SAFETY ROPE!!!!!!!!")
            self.game_over()
            return
            
        # You die if you jump off the ledge
        self.game_over()

    def game_over(self):
        """Handle game over state"""
        print("\nWELCOME TO PURGATORY!! HERE AT THIS CROSSROADS YOU HAVE THREE OPTIONS:")
        print("\nBEFORE YOU ARE THREE DOORS. EACH WILL BRING YOU TO A DIFFERENT PLACE- ")
        print("A- TO HELL (WHERE THE GAME ENDS)")
        print("B- BACK TO LIFE, UNHARMED")
        print("C- YOU STAY HERE AND MUST CHOOSE AGAIN")
        print("\nTHE DOORS ARE RANDOMLY DIFFERENT EACH TIME!!")
        
        while True:
            door = input("\nCHOOSE YOUR DOOR: 1, 2, OR 3?? ")
            try:
                door = int(door)
                if door < 1 or door > 3:
                    continue
                    
                # Randomly determine outcome
                fate = random.randint(0, 3)
                
                if door == fate:
                    # Back to life
                    self.display_room()
                    return
                    
                door = door - 1
                if door < 1:
                    door = 3
                    
                if door == fate:
                    # Game over
                    print("GAME OVER!")
                    sys.exit()
                    
                # Stay in purgatory
                print("YOU'RE STILL HERE!")
                
            except ValueError:
                print("CHOOSE 1, 2, OR 3!")

    def run(self):
        """Main game loop"""
        print("\n" + "=" * 50)
        print("SOFTPORN ADVENTURE")
        print("WRITTEN BY CHUCK BENTON")
        print("COPYRIGHT 1981")
        print("BLUE SKY SOFTWARE")
        print("\nPYTHON RECREATION")
        print("=" * 50)
        
        # Ask if a saved game should be loaded
        load_game = input("\nSHOULD A SAVED GAME BE LOADED? (Y/N) ").upper()
        if load_game == "Y":
            print("GAME LOADING FEATURE NOT IMPLEMENTED IN THIS VERSION.")
        
        print("\nPLEASE WAIT")
        print("INITIALIZATION PHASE")
        time.sleep(1)
        
        # Display the starting room
        self.display_room()
        
        # Main game loop
        while not self.game_over:
            verb, noun = self.get_user_input()
            self.process_command(verb, noun)


def main():
    """Main function to start the game"""
    game = SoftpornAdventure()
    game.run()


if __name__ == "__main__":
    main()