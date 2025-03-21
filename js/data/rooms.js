/**
 * Room data for the game
 * Contains room descriptions, exits, and initial objects
 */

// Room descriptions
export const roomDescriptions = {
    1: "I'M IN A HALLWAY.",
    2: "I'M IN A BATHROOM.",
    3: "I'M IN A SLEAZY BAR.",
    4: "I'M ON A STREET OUTSIDE THE BAR.",
    5: "I'M IN THE BACKROOM.",
    6: "I'M IN A FILTHY DUMPSTER!",
    7: "I'M INSIDE THE ROOM I BROKE INTO!",
    8: "I'M ON A WINDOW LEDGE.",
    9: "I'M IN A HOOKER'S BEDROOM.",
    10: "I'M ON A HOOKER'S BALCONY.",
    11: "I'M ON A DOWNTOWN STREET.",
    12: "I'M IN A QUICKIE MARRIAGE CENTER.",
    13: "I'M IN THE MAIN CASINO ROOM.",
    14: "I'M IN THE '21 ROOM'.",
    15: "I'M IN THE LOBBY OF THE HOTEL.",
    16: "I'M IN THE HONEYMOON SUITE.",
    17: "I'M IN THE HOTEL HALLWAY.",
    18: "I'M ON THE HONEYMOONER'S BALCONY.",
    19: "I'M AT THE HOTEL DESK.",
    20: "I'M IN A TELEPHONE BOOTH.",
    21: "I'M IN THE DISCO.",
    22: "I'M ON A RESIDENTIAL STREET.",
    23: "I'M IN THE DISCO'S ENTRANCE.",
    24: "I'M IN THE PHARMACY.",
    25: "I'M IN THE PENTHOUSE FOYER.",
    26: "I'M IN THE JACUZZI!",
    27: "I'M IN THE KITCHEN.",
    28: "I'M IN THE GARDEN.",
    29: "I'M IN THE LIVING ROOM.",
    30: "I'M ON THE PENTHOUSE PORCH."
};

// Room exits structure: [room_id, [directions_available]]
export const roomExits = {
    1: [1, ["NORTH", "EAST"]],
    2: [2, ["SOUTH"]],
    3: [3, ["NORTH", "WEST"]],
    4: [2, ["NORTH", "EAST", "WEST"]],
    5: [5, ["WEST", "UP"]],
    6: [6, ["WEST"]],
    7: [7, ["NORTH"]],
    8: [19, ["SOUTH", "EAST"]],
    9: [9, ["NORTH", "DOWN"]],
    10: [13, ["SOUTH", "DOWN"]],
    11: [1, ["SOUTH", "EAST", "WEST"]],
    12: [2, ["EAST", "UP"]],
    13: [4, ["SOUTH", "WEST", "DOWN"]],
    14: [2, ["WEST", "DOWN"]],
    15: [5, ["SOUTH", "WEST"]],
    16: [1, ["MAGIC"]],
    17: [8, ["NORTH", "EAST", "UP"]],
    18: [6, ["UP"]],
    19: [14, ["EAST"]]
    // Add remaining rooms as needed
};

// Other areas descriptions
export const otherAreasDescriptions = {
    1: "NORTH AND EAST",
    2: "SOUTH",
    3: "NORTH AND WEST",
    4: "NORTH, EAST AND WEST",
    5: "WEST AND UP",
    6: "WEST",
    7: "NORTH",
    8: "SOUTH AND EAST",
    9: "NORTH AND DOWN",
    10: "SOUTH AND DOWN",
    11: "SOUTH, EAST AND WEST",
    12: "EAST AND UP",
    13: "SOUTH, WEST AND DOWN",
    14: "WEST AND DOWN",
    15: "SOUTH AND WEST",
    16: "BY MAGIC!",
    17: "NORTH, EAST AND UP",
    18: "UP",
    19: "EAST"
};

// Initial room objects - what objects are in each room at the start
export const initialRoomObjects = {
    1: [8], // Desk in hallway
    2: [9, 10, 11, 12], // Items in bathroom
    3: [15, 14, 23], // Items in bar
    4: [18], // Billboard on street
    5: [16, 20], // Pimp and TV in backroom
    6: [56], // Garbage in dumpster
    9: [17, 26] // Hooker and bed in bedroom
    // Add more room objects as needed
};