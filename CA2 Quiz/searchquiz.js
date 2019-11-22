// Name: Loh Kar Wei
// Admin Num: 1904204
// Class: DISM/FT/1A/02

const fuzzy = require('fuzzy');
const fs = require('fs');
const read = require("readline-sync");
const misc = require('./misc.js');

class SearchQuiz{
    //  Return to Main Menu Page
    constructor(mainMenu){
        this.toMainPage = () => {
            mainMenu();
        }
        this.quizList;
    }

    searchFuzzy(results){
         //  List of quiz objects found
         let resultMap = results.map((el) => {
            return el.index;
        })
        misc.output(`${resultMap.length} results found.`);
        let matches = [];
        for(var i in resultMap){
            matches.push(this.quizList[resultMap[i]]);
        }
        //  If no matching results
        if(matches.length <= 0){
            misc.output("There are no matching results.");
            this.searchTitle();
        }else{
            this.chooseResults(matches);
        }
    }

    //  Search for Quiz using title using fuzzy module
    searchTitleFuzzy(input){
        //  Fuzzy Search the quiz title
        let results = fuzzy.filter(input, this.quizList, {extract: (el) => {
            return el.title;
        }})
        this.searchFuzzy(results);
    }

    //  Search for Quiz using user
    searchUserFuzzy(input){
        let results = fuzzy.filter(input, this.quizList, {extract: (el) => {
            return el.user;
        }})
        this.searchFuzzy(results);
    }

    //  Search for user who wrote the quiz instead
    searchUser(){
        let userQueryRegex = /.*\S.*/;  //  Input cannot be blank
        let userQuery = read.question("Search Quiz User: (-1 to exit)\n>> ", {limit: userQueryRegex, limitMessage: "Type something!"});

        if(userQuery == -1) this.searchAQuiz();
        else this.searchUserFuzzy(userQuery);
    }

    //  Get input for user searching quiz title
    searchTitle(){
        let userQueryRegex = /.*\S.*/;  //  Input cannot be blank
        let userQuery = read.question("Search Quiz Title: (-1 to exit)\n>> ", {limit: userQueryRegex, limitMessage: "Type something!"});

        if(userQuery == -1) this.searchAQuiz();
        else this.searchTitleFuzzy(userQuery);
    }

    //  Initialise the quiz obj from JSON file
    initQuizObj(quizObj){
        let newQnsList = [];
        for(var i = 0; i < quizObj.qnsList.length; i ++){
            let mcqQns = quizObj.qnsList[i];
            let newMcqQns = new misc.MCQ(mcqQns.qns, mcqQns.choices, mcqQns.ans);
            newQnsList.push(newMcqQns);
        }
        let newQuizObj = new misc.Quiz(quizObj.title, quizObj.descrip, quizObj.user, quizObj.cat, newQnsList, () => {this.toMainPage()});
        return newQuizObj;
    }

    //  Get the quiz object chosen
    findQuiz(quizDetails){
        try{
            let data = fs.readFileSync(`quizzes/${quizDetails.cat}/${quizDetails.title}.json`);
            let quizObj = JSON.parse(data);
            let newQuizObj = this.initQuizObj(quizObj);
            newQuizObj.showQuizMenu();
        }catch(err){
            if(err.code == "ENOENT"){
                misc.output("Sorry, something went wrong, file can't be found. Please try again");
                this.toMainPage();
            }
        }
    }

    //  Navigate around the results matched
    chooseResults(matches){
        //  Counter for number of files
        var z = 1;
        var limitArr = [];
        
        //  Validate inputs
        function setLimit(end){
            limitArr = ["n", "N", "p", "P", "x", "X"];
            for(var i = 1; i < end + 1; i ++){
                limitArr.push(i);
            }
            return limitArr;
        }
    
        let start = 0, end = 5, dontExit = true;
        
        //  Displaying the list of results onto the screen
        function displayFiles(filesToShow, matches){

            misc.output("<-- VIEW RESULTS -->");
            for(var j = 0; j < filesToShow.length; j ++){
                let z = matches.indexOf(filesToShow[j]) + 1;
                console.log(`[${j + 1}]\t${z}. ${filesToShow[j].title} (${filesToShow[j].cat}) (${filesToShow[j].user})`);
            }
        }
        do{
            //  More than 5 matches so have to view through a few pages of quizzes
            if(matches.length > 5){
                let filesToShow = matches.slice(start, end);
                displayFiles(filesToShow, matches);
                setLimit(5);
            //  Only 5 files so no need view through
            }else{
                displayFiles(matches, matches);
                setLimit(matches.length);
            }
            let instrucText = `\nInput the number to choose the result. N for next, P for Previous and X to Exit\n>> `;
            let instruc = read.question(instrucText, {limit: limitArr, limitMessage: "Please input a valid command"});
            
            //  If instruc is a number
            if(instruc.match(/^[1-5]{1}$/)){
                let fileToLoad = matches[start + parseInt(instruc) - 1];
                
                this.findQuiz(fileToLoad);
                dontExit = false;
            //  If instruc isn't a number (N, P or X)
            }else if(instruc.toUpperCase() == "N"){
                
                if((end + 5) > matches.length){
                    misc.output("There are no more results after this");
                    if(matches.length > 5) start = matches.length - 5;
                    else start = 0;
                    end = matches.length;
                }
                else{
                    start += 5;
                    end += 5;
                }
            }else if(instruc.toUpperCase() == "P"){
                if((start - 5) < 0){
                    misc.output("There are no more results before this");
                    start = 0;
                    if(matches.length > 5) end = 5;
                    else end = matches.length;
                }else{
                    start -= 5;
                    end -= 5;
                }
            }else if(instruc.toUpperCase() == "X"){
                dontExit = false;
                this.searchAQuiz();
            }
        }while(dontExit);
    }
    
    //  Choose item to search (title or user) or exit
    searchAQuiz(){
        try{
            let data = fs.readFileSync('quizzes/allquizzes.json');
            this.quizList = JSON.parse(data);
                
            let userCommand = read.keyInSelect(["Search Quiz Title", "Search User"], {guide: false, cancel: "EXIT"});
            switch(userCommand){
                case -1:
                    this.toMainPage();
                    break;
                case 0:
                    this.searchTitle();
                    break;
                case 1:
                    this.searchUser();
                    break;
            }
        //  If file not found (no quizzes yet, somehow)
        }catch(err){
            if(err.code == "ENOENT"){
                misc.output("No quizzes yet, why not make one?");
                this.mainMenu();
                return;
            }
        }
    }
}

module.exports = {
    SearchQuiz: SearchQuiz
}