// Code to fetch the JSON file containing the questions.
xmlhttp = new XMLHttpRequest();
const url = "questions.json";
xmlhttp.open("GET", url, false);
xmlhttp.send();
usefulResponse = xmlhttp.responseText;
jsonDoc = JSON.parse(usefulResponse);

//Code to get the div's and buttons by using the getelementbyid DOM function.
const sections = jsonDoc['questions'];
const quizContainer = document.getElementById("quiz");
const resultsContainer = document.getElementById("results");
const submitButton = document.getElementById("submit");
const previousButton = document.getElementById("previous");
const nextButton = document.getElementById("next");

//setting the category to default intially.
category = 'all';
//To set the current slide number for the slides once the quiz/review slides are generated.
let currentSlide = 0;


(function () {
  // Display the Welcome Page everytime.
  buildWelcome();  
})();

//Function to render the Quiz slides.
function buildQuiz(sectionQuestions) {
  document.getElementById("welcome").setAttribute("style","display:none");
  let output = []; //To store the HTML output.
  let  testQuestions = sectionQuestions;
  for (i = 0; i < testQuestions.length; i++) {
    let answers = []; //To store the answer choices for every question
    let item_q = testQuestions[i];
    for (item in item_q.choices) {
      answers.push(
        `
           <input type="radio"  name="question${item_q.id}" value="${item}">
            ${item_q.choices[item]} <br>
         `
      );
    }
    output.push(
      `<div class="slide">
         <div class="question"> ${item_q.question} </div>
         <div class="answers"> ${answers.join("")} </div>
       </div>`
    );

  }
  document.getElementById("quiz").setAttribute("style","display:block");
  quizContainer.innerHTML = output.join(""); //setting the content of the quizContainer DIV
  document.getElementById('buttons').setAttribute("style","display:block");
  document.getElementById("results").setAttribute("style","display:block");
  
  //Results, upon end session.
  submitButton.addEventListener("click", function(){showResults(sectionQuestions);});
  previousButton.addEventListener("click", showPreviousSlide);
  nextButton.addEventListener("click", showNextSlide);
  
  //timeout because of the delay between function creation and listener creation.
  
}

//Function to render the Review Slides.
function buildReview(sectionQuestions) {
  document.getElementById("welcome").setAttribute("style","display:none");
  let output = []; //To store the HTML output.
  let  testQuestions = sectionQuestions;
  for (i = 0; i < testQuestions.length; i++) {
    let answers = []; //To store the answer choices for every question
    let item_q = testQuestions[i];
    let num=1;
    let userChoice = JSON.parse(localStorage.getItem(category))[item_q.id];
    // The user choice is displayed in Green if he answered correctly and in red if answered incorrectly.
    if(userChoice == item_q.answer){
      answers.push(`
      <h3 style="color:lightgreen;"> Your Answer: ${Number(userChoice)+1} </h3> <br/>
    `)
    }else{
      answers.push(`
      <h3 style="color:red;"> Your Answer: ${Number(userChoice)+1} </h3> <br/>
    `)
    }
    
    for (item in item_q.choices) {
      if(item == item_q.answer){
        answers.push(
          `
             <p style="color:lightgreen;"> ${num}. ${item_q.choices[item]} <br>
           `
        );
      }else{
        answers.push(
          `
             <p> ${num}. ${item_q.choices[item]} <br>
           `
        );
      }
      
      num++;
    }
    output.push(
      `<div class="slide">
         <div class="question"> ${item_q.question} </div>
         <div class="answers"> ${answers.join("")} </div>
       </div>`
    );

  }
  document.getElementById("quiz").setAttribute("style","display:block");
  quizContainer.innerHTML = output.join(""); //setting the content of the quizContainer DIV
  document.getElementById('buttons').setAttribute("style","display:block");
  document.getElementById("results").setAttribute("style","display:none");
  
  //Results, upon end session.
  submitButton.addEventListener("click", function(){location.reload();});
  previousButton.addEventListener("click", showPreviousSlide);
  nextButton.addEventListener("click", showNextSlide);
  
  //timeout because of the delay between function creation and listener creation.
  
}

//Function to call buildquiz and buildreview based on user button clicks.
function start(j,state) {
  sectionQuestions="";
  if(j=='all'&& state=="new"){
    const obj =[];
    for(i in sections){
      obj.push(sections[i]);
      localStorage.removeItem(sections[i]);
    }
    sectionQuestions = obj[0].concat(obj[1]);
    
  }else if(j!="all" && state=="new"){
    sectionQuestions = getData(j);
    for(nques in JSON.parse(localStorage.getItem(j))){
      let tempVar  = JSON.parse(localStorage.getItem("all"));
      delete tempVar[nques];
      localStorage.setItem("all",JSON.stringify(tempVar));      
    }
  }else{
    if(j=='all'){
      const obj =[];
    for(i in sections){
      obj.push(sections[i]);
      
    }
    sectionQuestions = obj[0].concat(obj[1]);
    }else if (j!='all'){
      sectionQuestions = getData(j);
    }
  }
  
  if(state=='new'){
    localStorage.removeItem(j);
    buildQuiz(sectionQuestions);
    document.getElementById('heading').innerText="Category: "+j.toUpperCase();
  }
  if(state=='old'){
   let attempted = JSON.parse(localStorage.getItem(j));
   serveQuestions=[];
   for(item in sectionQuestions){
      if(!attempted[sectionQuestions[item].id]) serveQuestions.push(sectionQuestions[item])
    }
    sectionQuestions = serveQuestions;
    buildQuiz(sectionQuestions);
    document.getElementById('heading').innerText="Category: "+j.toUpperCase();    
  }
  if((state=='review') &&(attempted_questions>0)){
    let attempted = JSON.parse(localStorage.getItem(j));
     serveQuestions=[];
    for(item in sectionQuestions){
      if(attempted[sectionQuestions[item].id]) serveQuestions.push(sectionQuestions[item])
    }
    sectionQuestions = serveQuestions;
    buildReview(sectionQuestions);
    document.getElementById('heading').innerText="Category: "+j.toUpperCase();
  }else if( state=='review' && attempted_questions==0){
    window.alert("No Questions to Review!");
  }
  showSlide(0);
    
}

//Shows next slide. Handler for Next Button.
function showNextSlide() {
  showSlide(currentSlide + 1);
}

//Shows previous slide. Handler for Previous Button.
function showPreviousSlide() {
  showSlide(currentSlide - 1);
}
//To save the attempted questions in HTML5 Local Storage.
function attempted(question_number, answer,otherCat){
  //read from local storage
  //add question id and selected option
  //write to local storage
  savedQuestions={};
  catsavedQuestions={};
   console.log(otherCat);
    if(localStorage.getItem("all")){
      savedQuestions = JSON.parse(localStorage.getItem("all"));
    }
    if(localStorage.getItem(otherCat)){
      catsavedQuestions = JSON.parse(localStorage.getItem(otherCat));
    }

    savedQuestions[question_number] = answer;
    catsavedQuestions[question_number] = answer;

    localStorage.setItem("all",JSON.stringify(savedQuestions)); 
    localStorage.setItem(otherCat,JSON.stringify(catsavedQuestions));  
}
//Function to render the current slide.
function showSlide(n) {
  slides = document.querySelectorAll(".slide");
  slides[currentSlide].classList.remove("active-slide");
  slides[n].classList.add("active-slide");
  currentSlide = n;
  submitButton.style.display = "inline-block";
  if (currentSlide === 0) {
    previousButton.style.display = "none";
  } else {
    previousButton.style.display = "inline-block";
  }

  if (currentSlide === slides.length - 1) {
    nextButton.style.display = "none";

  } else {
    nextButton.style.display = "inline-block";

  }
}

//Function to render the intial welcome page.
function buildWelcome(){
  total_question=0;
  for(item in sections){
      total_question +=sections[item].length;
    }
    if(localStorage.getItem('all') && localStorage.getItem('all')!="{}"){
      attempted_questions = Object.keys(JSON.parse(localStorage.getItem('all'))).length;
    }else{
      attempted_questions = 0;
    }
  
  const text_html=[];
  text_html.push(
    `<div class="styled-select slate" style = "margin-top:1%;" >
    <table style="margin-left:11%">
    <tr>
    <td> <h1 style="color:black; text-align:left;"> Choose a category: </h1> </td>
    <td width="50%">
    <select id="category" onchange="selectBuild()">
    <option value="all"> All `
  );
  for (j in sections) {
    text_html.push(`<option value="${j}">`+ j);
  }
  text_html.push(`</select></td></tr></table></div>`);
  text_html.push(
    `<div id="all-ques">
      <hr>
     <div class="section-data">
         <table>
            <tr>
            <td width="50%">
            <h1 style="color:black; text-align:left;"> Total Number of Questions: </h1>
            </td>
            <td width="50%">
            <h1 id="total_questions" style="color:black; text-align:left;"> ${total_question} </h1>
            </td>
            </tr>
            <tr>
            <td width="50%">
            <h1 style="color:black; text-align:left;">  Number of Questions Attempted: </h1>
            </td>
            <td width="50%">
            <h1 id="attempted_questions" style="color:black; text-align:left;"> ${attempted_questions} </h1>
            </td>
            </tr>
            <tr>
            <td width="50%">
            <h1  style="color:black; text-align:left;">  Number of Questions Left: </h1>
            </td>
            <td width="50%">
            <h1 id='questions_left' style="color:black; text-align:left;"> ${total_question - attempted_questions} </h1>
            </td>
            </tr>
             <tr>
             <td width="35%">
             <h1 style="color:black; text-align:left;"> Progress: </h1>
             </td>
             <td width="65%">
             <div class="w3-dark-grey w3-large">  
               <div id="progress-percent" class="w3-container w3-green" style="width:${Math.round(attempted_questions/total_question*100)}"> ${Math.round(attempted_questions/total_question*100)}% </div>
             </div> 
             </td>
             </tr>
             </table>
             <br>
         </div>
         <div style="margin-left: 11%; float:left; margin-bottom:2%;">
             <button id="all">Start New</button>
             <span id='leftBlock'><button id="left">Continue</button></span>
             <button id="review">Review</button>
         </div>
          
          </div>`);
          
      document.getElementById('welcome').innerHTML = text_html.join("");
      document.getElementById('heading').innerText="Welcome to the Testing Dashboard";
      document.getElementById("all").addEventListener("click",function(){start(category,'new')});
      document.getElementById("left").addEventListener("click",function(){start(category,'old')});
      document.getElementById("review").addEventListener("click",function(){start(category,'review')});
      document.getElementById('buttons').setAttribute("style","display:none");
      document.getElementById("quiz").setAttribute("style","display:none");
      document.getElementById("results").setAttribute("style","display:none");
      document.getElementById("leftBlock").style.display='none';
      if(attempted_questions>0){
        document.getElementById("leftBlock").setAttribute("style","display:inline");
      }
      
}

//Function to extract the required data from the JSON.
function getData(j){
  const testQuestions = jsonDoc['questions'][j];
  return testQuestions;
}

//Function to generate the Progress bars after ending a session.
function showResults(sectionQuestions) {
  // Get all answer containers from the session.
  const answerContainers = quizContainer.querySelectorAll(".answers");
  const testQuestions = sectionQuestions;
  
  //add logic for attempted questions

  // Statistics of User's Answers
  let numCorrect = 0;
  let notAttempted = 0;
  let numInCorrect = 0;
  for (i = 0; i < testQuestions.length; i++) {
    item_q = testQuestions[i];
    const answerContainer = answerContainers[i];
    const selector = `input[name=question${item_q.id}]:checked`;
    const userAnswer = (answerContainer.querySelector(selector) || {}).value;
    if (userAnswer == item_q.answer) {
      numCorrect++;
      answerContainers[i].style.color = "lightgreen";
    } else if (userAnswer == {}.value) {
      notAttempted++;
      answerContainers[i].style.color = "blue";
    }
    else {
      numInCorrect++;
      answerContainers[i].style.color = "red";
    }
    attempted(item_q.id,userAnswer,item_q.cat);
  }
  const correct = numCorrect/testQuestions.length;
  const Incorrect = numInCorrect/testQuestions.length;
  const missing = notAttempted/testQuestions.length;
  // Show statistics for answers out of total

  resultsContainer.innerHTML = `
    <center> 
    <table cellpadding="10">
    <tr>
    <td width="35%">
    <h1 style="color:black; text-align:left;"> Answered Correctly: </h1>
    </td>
    <td width="65%">
    <div class="w3-dark-grey w3-large">  
      <div class="w3-container w3-green" style="width:${Math.round(correct * 100)}%"> ${Math.round(correct * 100)}% </div>
    </div> 
    </td>
    </tr>
    <tr>
    <td width="35%">
    <h1 style="color:black; text-align:left;"> Answered Incorrectly: </h1>
    </td>
    <td width="65%">
    <div class="w3-dark-grey w3-large">
      <div class="w3-container w3-red" style="width:${Math.round(Incorrect * 100)}%"> ${Math.round(Incorrect * 100)}%</div> 
    </div>
    </td>
    </tr>
    <tr>
    <td width="35%">
    <h1 style="color:black; text-align:left;"> Not Answered: </h1>
    </td>
    <td width="65%">
    <div class="w3-dark-grey w3-large">
      <div class="w3-container w3-blue" style="width:${Math.round(missing * 100)}%">${Math.round(missing * 100)}%</div>
    </div> 
    </td>
    </tr>
    </table>
    </center>`;
  quizContainer.setAttribute("style","display:none");
  previousButton.setAttribute("style","display:none");
  nextButton.setAttribute("style","display:none");
  submitButton.setAttribute("style","display:block;margin-left:40%");
  submitButton.addEventListener("click", function(){location.reload();});
}

// Onchange handler for the category selector.
function selectBuild() {
  category = document.getElementById("category").value;
  total_question = 0;
  if(category=='all'){
    for(item in sections){
      total_question +=sections[item].length;
    }
  }else{
    total_question += sections[category].length;
  }
  if(localStorage.getItem(category) && localStorage.getItem(category)!="{}"){
    attempted_questions = Object.keys(JSON.parse(localStorage.getItem(category))).length;
  }else{
    attempted_questions = 0;
  }
  document.getElementById('attempted_questions').innerHTML = attempted_questions;
  document.getElementById('questions_left').innerHTML = total_question - attempted_questions;
  document.getElementById("total_questions").innerHTML=total_question;
  document.getElementById("progress-percent").innerHTML = Math.round(attempted_questions/total_question*100)+'%';
  document.getElementById("progress-percent").setAttribute("style",`width:${Math.round(attempted_questions/total_question*100)}`);
  if(attempted_questions == 0){
    document.getElementById("leftBlock").style.display='none';
  } else{
    document.getElementById("leftBlock").style.display='inline';
  }
  
}