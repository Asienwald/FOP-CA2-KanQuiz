// Name: Loh Kar Wei
// Admin Num: 1904204
// Class: DISM/FT/1A/02

const read = require('readline-sync');
const fs = require('fs');
const path = require('path');
const misc = require('./misc.js');

//  Class to Choose quiz and then do it
class DoQuiz{
    constructor(mainMenu){
        this.toMainPage = () => {
            mainMenu();
        }
    }

    //  Return to Main Menu
    toMainMenu(){
        let goHome = read.keyInYNStrict("Return to Main Menu?");
        if(goHome) this.toMainPage();
        else this.chooseCategory();
    }

    //  User choose which category to do
    listCategories(){
        var catIndex = read.keyInSelect(misc.CATEGORIES, ">> ", {guide: false, cancel: "EXIT"});
        if(catIndex == -1){
            misc.output("Exited out of Choose Category Menu. Returning to Main Menu.");
            this.toMainPage();
            return;
        }
        else return catIndex;
    }
    
    // Choose category & get path to files containing the quizzes
    chooseCategory(){
        console.log(`Please choose the quiz category you would like to attempt:`);
        //  Looping through all categories & display them
        var catIndex = this.listCategories();
    
        if(catIndex != undefined){
            misc.output(`[${misc.CATEGORIES[catIndex]}] category selected`);
            this.getFilesFromCategory(catIndex);
        }
    }

    //  Read directory of that category and display all files in there (if any)
    getFilesFromCategory(catIndex){
        //  Get file path to category
        var pathToCat = path.join(__dirname, `/quizzes/${misc.CATEGORIES[catIndex]}/`);
    
        //  Read all Files in directory
        let files = fs.readdirSync(pathToCat);

        if(files.length <= 0){
            misc.output("There are currently no quizzes in this Category");
            this.chooseCategory();
        }else{
            files.forEach((file, index) => {
                //  Remove .json from quiz names
                files[index] = file.replace(".json", "");
            })
        }
        this.chooseQuizFile(files, misc.CATEGORIES[catIndex]);
    }
    
    //  Choose quiz file from list of quiz files in the category directory
    chooseQuizFile(files, cat){
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
    
        function displayFiles(filesToShow, files){
            misc.output("<-- VIEW QUIZZES -->");
            for(var j = 0; j < filesToShow.length; j ++){
                let z = files.indexOf(filesToShow[j]) + 1;
                console.log(`[${j + 1}]\t${z}. ${filesToShow[j]}`);
            }
        }
        do{
            //  More than 5 files so have to view through a few pages of quizzes
            if(files.length > 5){
                let filesToShow = files.slice(start, end);
                displayFiles(filesToShow, files);
                setLimit(5);
            //  Only 5 files so no need view through
            }else{
                displayFiles(files, files);
                setLimit(files.length);
            }
            let instrucText = `\nInput the number to choose the quiz file. N for next, P for Previous and X to Exit\n>> `;
            let instruc = read.question(instrucText, {limit: limitArr, limitMessage: "Please input a valid command"});
            
            //  If instruc is a number
            if(instruc.match(/^[1-5]{1}$/)){
                let fileToLoad = files[start + parseInt(instruc) - 1];
                dontExit = false;   //  Exit the while loop before you go to another page
                this.loadQuizFromFile(fileToLoad, cat);
            //  If instruc is not a number (N, P, X)
            }else if(instruc.toUpperCase() == "N"){
                if((end + 5) > files.length){
                    misc.output("There are no more quizzes after this");
                    if(files.length > 5) start = files.length - 5;
                    else start = 0;
                    end = files.length;
                }
                else{
                    start += 5;
                    end += 5;
                }
            }else if(instruc.toUpperCase() == "P"){
                if((start - 5) < 0){
                    misc.output("There are no more quizzes before this");
                    start = 0;
                    if(files.length > 5) end = 5;
                    else end = files.length;
                }else{
                    start -= 5;
                    end -= 5;
                }
            }else if(instruc.toUpperCase() == "X"){
                dontExit = false;
                this.toMainMenu();
                return;
            }
        }while(dontExit);
    }
    
    //  Re-initialise Quiz & MCQ objects so can access its functions from object saved in JSON format
    initQuizObj(quizObj){
        let newQnsList = [];
        for(var i = 0; i < quizObj.qnsList.length; i ++){
            let mcqQns = quizObj.qnsList[i];
            let newMcqQns = new misc.MCQ(mcqQns.qns, mcqQns.choices, mcqQns.ans);
            newQnsList.push(newMcqQns);
        }
        let newQuizObj = new misc.Quiz(quizObj.title, quizObj.descrip, quizObj.user, quizObj.cat, newQnsList, () => {this.toMainMenu()});
        return newQuizObj;
    }
    
    //  Parse the quiz object from .JSON format, initialise it and show it's quiz menu
    loadQuizFromFile(fileToLoad, cat){
        let filePath = path.join(__dirname, `/quizzes/${cat}/${fileToLoad}.json`);
        var quizObj = JSON.parse(fs.readFileSync(filePath));
        
        let newQuizObj = this.initQuizObj(quizObj);
        newQuizObj.showQuizMenu();
        return; 
    }
}

//  Export Class for main to use
module.exports = {
    DoQuiz: DoQuiz
}
