// Name: Loh Kar Wei
// Admin Num: 1904204
// Class: DISM/FT/1A/02

const misc = require("./misc.js");
const inq = require('inquirer');
const read = require('readline-sync');
const fs = require('fs');

//  Class to create new quizzes
class CreateQuiz{
    //  Allow you to return to Main Menu
    constructor(mainMenu){
        this.toMainPage = function(){
            mainMenu();
        }
    }

    //  Func to create a new MCQ object
    async createNewQuestion(){ 
        //  Function to check for empty inputs
        function validateRegex(input){
            let validateRegex = /^\s*$/;
            //  If input is empty string
            if(input.match(validateRegex)){
                misc.output("Empty inputs are not accepted.");
                return false;
            }
            else return true;
        }

        //  Define inputs needed for a MCQ question
        let questions = [{
            name: "question",
            message: "Please input your question: ",
            type: "editor",
            validate: validateRegex
        }, {
            name: "choice1",
            message: "Choice 1:",
            type: "input",
            validate: validateRegex
        }, {
            name: "choice2",
            message: "Choice 2:",
            type: "input",
            validate: validateRegex
        }, {
            name: "choice3",
            message: "Choice 3:",
            type: "input",
            validate: validateRegex
        }, {
            name: "choice4",
            message: "Choice 4:",
            type: "input",
            validate: validateRegex
        }]
        return new Promise((resolve, reject) => {
            //  Pass questions in inquirer prompt
            inq.prompt(questions).then((ans) => {
                var qns = ans.question; //  Question str
                //  Arr of all the choices in qns
                var qnsChoices = [ans.choice1, ans.choice2, ans.choice3, ans.choice4];

                //  Lets user pick from choices so it is called later
                let ansQns = [{
                    name: "answer",
                    message: "Choose the correct answer for this question",
                    type: "list",
                    choices: qnsChoices
                }]
                inq.prompt(ansQns).then((ans) => {
                    //  Init new MCQ object form gathered inputs
                    var mcqQns = new misc.MCQ(qns, qnsChoices, ans.answer);
                    //  Resolves the promise and passes the obj
                    resolve(mcqQns);
                })
            })
        })
    }

    //  Write the newly created quiz object's title and category in allquizzes.json
    writeQuizToAllList(quizObj){
        let newQuizToWrite = {title: quizObj.title, cat: quizObj.cat, user: quizObj.user};
        fs.readFile('quizzes/allquizzes.json', (err, data) => {
            if(err){
                //  If no quizzes yet make new allquizzes.json
                if(err.code == "ENOENT") fs.writeFileSync('quizzes/allquizzes.json', JSON.stringify([newQuizToWrite]));
            }else{
                //  Append to allquizzes.json
                let quizList = JSON.parse(data);
                quizList.push(newQuizToWrite);

                fs.writeFileSync('quizzes/allquizzes.json', JSON.stringify(quizList));
            }
            this.toMainPage();
        })
    }

    //  Writes Quiz obj to a .json file
    writeQuizToFile(quizObj){
        //  Path of file
        let quizName = `quizzes/${quizObj.cat}/${quizObj.title}.json`;

        //Stringify it into a format suitable for .json
        let quizContent = JSON.stringify(quizObj);

        fs.writeFile(quizName, quizContent, 'utf8', (err) => {
            if(err) misc.output("There was an error writing the quiz to a file");
            else{
                misc.output("Quiz Successfully saved!");
                this.writeQuizToAllList(quizObj);
            }
        })
    }

    //  Loops 5 times to get input for each question and then writes it to its JSON file
    async getQuestions(quizObj){
        let numOfQns = 5, quizQuestions = new Array();
        for(var i = 0; i < numOfQns; i ++){
            console.log(`\n<-- QUESTION ${i + 1} -->\n`);
            let qns = await this.createNewQuestion().then((result) => {
                quizQuestions.push(result);
            })
        }
        quizObj.qnsList = quizQuestions;

        var submitBool = read.keyInYNStrict("Submit & Save the Quiz?");
        if(submitBool) this.writeQuizToFile(quizObj);
        else{
            misc.output("Operation Canceled");
            this.toMainPage();
        }
    }

    //  Get Quiz details like title, descrip, cat etc. (Not quiz questions)
    async getQuizDetails(){
        //  Ask cat first
        let catQns = [{
            name: "cat",
            message: "Choose the category of the quiz",
            type: "list",
            choices: misc.CATEGORIES
        }]

        function validateRegex(input){
            let validateRegex = /^\s*$/;
            //  If input is empty string
            if(input.match(validateRegex)){
                misc.output("Empty inputs are not accepted.");
                return false;
            }
            else return true;
        }

        return new Promise((resolve, reject) => {
            inq.prompt(catQns).then(({cat}) => {

                //check if quiz title alrdy taken
                function validateQuizTitle(title){
                    let dirToRead = `quizzes/${cat}/`, alrdyTaken = false;

                    if(title == "") alrdyTaken = true;

                    fs.readdir(dirToRead, (err, files) => {
                        if(err) throw err;
                        if(files.length != 0){
                            files.forEach((file) => {
                                //  Remove .json from quiz names
                                let fileName = file.replace(".json", "");
                                if(fileName == title){
                                    console.log("\nQuiz already exists, try again");
                                    alrdyTaken = true;
                                } 
                            })
                        }
                    })
                    return !alrdyTaken;
                    // if(alrdyTaken) return false;
                    // else return true;
                }

                let questions = [{
                    name: "title",
                    message: "Input the title of the quiz",
                    type: "input",
                    //  Function to check if title exists is passed into "title" prompt
                    validate: validateQuizTitle
                }, {
                    name: "description",
                    message: "Please enter a short description on your quiz",
                    type: "editor",
                    validate: validateRegex
                }, {
                    name: "user",
                    message: "What is your name?",
                    type: "input"
                }]
                inq.prompt(questions).then((ans) => {
                    //  Init a new Quiz object
                    let newQuiz = new misc.Quiz(ans.title, ans.description, ans.user, cat, []);
                    //  Promise resolved and quizobj passed
                    resolve(newQuiz);
                })
            })
        })
    }

    //Main function to be called for quiz creation process
    async createNewQuiz(){
        let userCommand = read.keyInYNStrict("Create your own quiz?");
        if(userCommand){
            await this.getQuizDetails().then((result) => {
                this.getQuestions(result);
            })
        }else this.toMainPage();
    }
}

//  Export Main func of create quiz
module.exports = {
    CreateQuiz: CreateQuiz
}