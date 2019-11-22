// Name: Loh Kar Wei
// Admin Num: 1904204
// Class: DISM/FT/1A/02

const read = require('readline-sync');

//  All Quiz Categories
CATEGORIES = new Array("IT", "Programming", "Informational", "Trivia");

//  Quiz class to hold 5 MCQ Questions
class Quiz{
    constructor(title, description, user, category, questions, mainMenu){
        this.title = title;
        this.descrip = description;
        this.cat = category;
        this.qnsList = questions;
        this.numOfQns = 5;
        this.i = 0;
        this.user = user;

        this.toMainMenu = () => {
            mainMenu();
        }

        //  Quiz start Menu that shows basic info about the quiz
        this.showQuizMenu = function(){
            console.log(`\n-------------------
    Quiz Title:\t${this.title}\n
    Quiz Description:\n${this.descrip}\n
    \nMade by:\t${this.user}\n
    -------------------\n`);
    
            let startQuiz = read.keyInYNStrict("Start the Quiz?");
            if(startQuiz){
                this.showQuizQuestions();
            }else{
                this.toMainMenu();
                return;
            }
        }
    }

    //  Use Durstenfeld Shuffle to shuffle the array of mcqquizzes
    shuffleMcq(quizArr) {
        for (var i = quizArr.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = quizArr[i];
            quizArr[i] = quizArr[j];
            quizArr[j] = temp;
        }
        return quizArr;
    }

    //  Check for empty answer inputs in the questions
    //  Returns true if all answered, false if not
    checkAllQnsAnswered(numOfQns){
        var qnsNotAnswered = [], allQnsAnswered = true;
        for(var i = 0; i < numOfQns; i ++){
            if(this.qnsList[i].userAns == ""){
                allQnsAnswered = false;
                qnsNotAnswered.push(i + 1);
            }
        }
        if(allQnsAnswered) return true;
        else{
            //  Identifies which questions are blank
            let qnsText = "Questions " + qnsNotAnswered.join(", ") + " are not answered. Please answer them.";
            console.log(qnsText);
            return false;
        }
    }

    //  Calls checkAllQnsAnswered and confirms submission of quiz OR jumping to unanswered questions (if not all qns answered)
    checkSubmitQuiz(){
        let areQnsAnswered = this.checkAllQnsAnswered(this.numOfQns);
        //  All questions are answered
        if(areQnsAnswered){
            console.log("<-- CONFIRM ANSWERS -->");

            //  Displays all qns and user's answers
            for(var j = 0; j < this.numOfQns; j ++){
                let qns = this.qnsList[j];
                console.log(`Question ${j + 1}:\t${qns.qns}
Your Answer:\t${qns.userAns}\n`);
            }

            //Double confirm if user wants to submit quiz or go back to some questions
            var submit = read.keyInYNStrict("Submit Quiz?");
            if(submit) return false;
            else return true;
        //  Some questions not answered
        }else{
            //  User can jump to any question he wants
            var userCommand = read.question("Please enter the question you would like to jump to\n>> ", {
                limit: /^[1-5]{1}$/,
                limitMessage: "Please input a valid question"
            })
            this.i = userCommand - 1;
            return true;
        }
    }

    //  Display each quiz question onto terminal for user to answer
    showQuizQuestions(){
        var quizList = this.shuffleMcq(this.qnsList), dontExit = true;
        do{
            var mcqQns = quizList[this.i];

            //  Display question & choices
            console.log(`\n<-- QUESTION ${this.i + 1} -->
${mcqQns.qns}
-------------------
Choice 1: ${mcqQns.choices[0]}\tChoice 2: ${mcqQns.choices[1]}
Choice 3: ${mcqQns.choices[2]}\tChoice 4: ${mcqQns.choices[3]}
-------------------
Your Answer: ${mcqQns.userAns}`);

            //  Limit commands to valid inputs
            let commandRegex = /^[1-4nNpPxX]{1}$/;

            //  Get user command for qns
            var userCommand = read.question("Please select your answer (1 to 4) or N/P to toggle between questions. X to submit: ", 
            {limit: commandRegex, limitMessage: "\nPlease input a valid command\n"});
            
            //  If user inputs a number
            if(userCommand.match(/^[1-4]{1}$/)){
                let userChosenAns = quizList[this.i].choices[parseInt(userCommand) - 1];

                //  Submit answer to MCQ object
                mcqQns.inputAns(userChosenAns);

                //  Go to next qns or submit if last question
                if((this.i + 1) < this.numOfQns) this.i ++;
                else dontExit = this.checkSubmitQuiz();
            // Else user doesn't input a number (which means N, P or X)
            }else{
                switch(userCommand.toUpperCase()){
                    case "N":
                        //  Check if user at last question > checks for user submission if yes
                        if((this.i + 1) >= this.numOfQns) dontExit = this.checkSubmitQuiz();
                        //  Else add 1 to question counter
                        else this.i ++;
                        break;
                    case "P":
                        //  Checks if user at first qns
                        if((this.i - 1) < 0) console.log("This is the 1st question. Press N to go to the next one.");
                        //  Else minus 1 from qns counter
                        else this.i --;
                        break;
                    case "X":
                        //  If input X check for user submission
                        dontExit = this.checkSubmitQuiz();
                        break;
                }
            }
        }while(dontExit)
        //  Submits quiz when dontExit is false
        this.submitQuiz();
    }

    //  Submits quiz and displays results (correct answers and your answers)
    submitQuiz(){
        var correct = 0;
        console.log(`\n<-- QUIZ RESULTS -->\n-------------------`);

        for(var i = 0; i < this.qnsList.length; i ++){
            let qns = this.qnsList[i];

            if(qns.isUserCorrect == true){
                correct ++;
                console.log(`Question ${i + 1}\t(Correct)\tYour Ans: ${qns.userAns}\tCorrect Ans: ${qns.ans}`);
            }else console.log(`Question ${i + 1}\t(Wrong)\tYour Ans: ${qns.userAns}\tCorrect Ans: ${qns.ans}`);
        }
        console.log("-------------------");
        console.log(`Quiz Outcome: ${correct} out of ${this.numOfQns} correct answers`);

        var goBack = read.keyInYNStrict("Go back to Quiz Menu?");
        if (!goBack){
            this.toMainMenu();    //  Go back to main menu
            return;
        }
        else this.showQuizMenu();
    }
}

//  MCQ Question Class
//  Each quiz object will have 5 MCQ objects
class MCQ{
    constructor(question, choices, answer){
        this.qns = question;
        this.choices = choices;
        this.ans = answer;
        this.userAns = "";  //  Holds user's answer
        this.isUserCorrect = false; //  Checks if user is correct
    }

    //  Allow user to input their ans and checks if its correct
    inputAns(ans){
        this.userAns = ans;
        if(this.userAns == this.ans) this.isUserCorrect = true;
        else this.isUserCorrect = false;
    }
}

//  Export these functions/class/vars in a module for other files
module.exports = {
    output: function(msg) {
        console.log(`\n${msg}\n`);
    },
    CATEGORIES: CATEGORIES,
    Quiz: Quiz,
    MCQ: MCQ
}
