// Name: Loh Kar Wei
// Admin Num: 1904204
// Class: DISM/FT/1A/02

const read = require('readline-sync');

//  Get all my custom modules
const createquizMod = require('./createquiz.js');
const misc = require("./misc.js");
const doquizMod = require("./doquiz.js");
const searchquizMod = require("./searchquiz.js");


//  Main Menu when user first starts program
function mainMenu(){
    misc.output("<----- WELCOME TO KANQUIZ (CMD VER) ----->");
    
    //  User chooses what he wants to do
    let mainMenuQuestions = ["Search Quizzes", "Show Categories", "Create a New Quiz"];
    let userCommand = read.keyInSelect(mainMenuQuestions, "What do you want to do today?\n>> ", {guide: false, cancel: "EXIT"});

    switch(userCommand){
        case -1:
            exitProgram();
            break;
        case 0: //  Search
            searchquiz.searchAQuiz();
            break;
        case 1: //  Show Cats
            doquiz.chooseCategory();
            break;
        case 2: //  Create New
            createquiz.createNewQuiz();
            break;
    }
}

//  Initialise all the objects that allows for program features
var createquiz = new createquizMod.CreateQuiz(() => {mainMenu();});
var doquiz = new doquizMod.DoQuiz(() => {mainMenu();})
var searchquiz = new searchquizMod.SearchQuiz(() => {mainMenu();});

//  Execute Main Menu first when program is run
mainMenu();

//  Exit the entire program
function exitProgram(){
    let userCommand = read.keyInYNStrict("Exit Kanquiz?");
    if(userCommand) {
        misc.output("Thank you for trying out Kanquiz CMD Ver, See you again!");
        process.exit();
    }
    else mainMenu();
}
