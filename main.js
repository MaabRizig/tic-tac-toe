

let gameBoard = (function(){
    const rows = 3;
    const cols = 3;
    let gameBoardArr = Array.from({length:rows},()=>Array.from({length:cols},()=>undefined));
    const marks = [0,1];
    let roundToMarkIdx = 0;

    function toggleMark(){
        roundToMarkIdx  = (roundToMarkIdx+1) % marks.length; 
    }
    
    function setMark(mark,...xyPos){
        if(mark !== marks[roundToMarkIdx])
            throw Error(`Current round is to ${marks[roundToMarkIdx]}`);

        const checkInt = xyPos.every((pos)=>Number.isInteger(pos));
        if(!checkInt){
            throw Error("position passed should be integers only");
        }

        const checkRange = xyPos[0]<=rows && xyPos[0]>=1 && xyPos[1]<=cols && xyPos[1]>=1; 
        if(!checkRange){
            throw Error("x and y positions are out-of-range");
        }

        if(gameBoardArr[xyPos[0]-1][xyPos[1]-1] !== undefined){
            throw Error(`The slot ${xyPos[0]},${xyPos[1]} are not empty`);
        }
        gameBoardArr[xyPos[0]-1][xyPos[1]-1] = mark;
        toggleMark();

    }

    function checkWinner(){
        let winRow = gameBoardArr                   // check for row-winning patterns
        .filter((row)=>row[0]!== undefined)
        .find((row)=>{   
            return row.every((mark)=> mark === row[0]);
        });
        if(winRow !== undefined){
            return winRow[0];
        }

        let i = 0;
        let r = 0; 
        for(i=0; i<cols; i++){            // check for col-winning patterns
            let firstMark = gameBoardArr[0][i];
            for(r=0; r<rows; r++){
                let currentMark = gameBoardArr[r][i];
                if(currentMark === undefined || (currentMark !== firstMark))
                    break;
            }
            if(r === rows)
                return firstMark;
        }
        
        let firstMark = gameBoardArr[0][0];
        for(i=0; i<rows; i++){                //check first-diag winning pattern
            let currentMark = gameBoardArr[i][i]; 
            if(currentMark === undefined || (currentMark !== firstMark))
                break;
        }
        if(i === rows)
            return firstMark;
        
        firstMark = gameBoardArr[0][cols-1];
        for(i=0; i<rows; i++){                      // check second-diag winning pattern
            let currentMark = gameBoardArr[i][cols-1-i];
            if(currentMark === undefined || (currentMark !== firstMark))
                break;
        }
        if(i==rows)
            return firstMark;

        let checkTie = !(gameBoardArr.some(row=>row.some(mark=>mark==undefined)));
        if(checkTie)
            return -1               // tie case

        return false;             // game unfinished yet
    }

    function getBoard(){
        return JSON.parse(JSON.stringify(gameBoardArr));
    }

    function resetBoard(){
        gameBoardArr = Array.from({length:rows},()=>Array.from({length:cols},()=>undefined));
        roundToMarkIdx = 0;
    }

    function showMarks(){
        return JSON.parse(JSON.stringify(marks));
    }
    return {setMark,checkWinner,getBoard,resetBoard,showMarks};
})();


function Player(mark,gameBoard,name,iconUrl){
    if(gameBoard.setMark === undefined || gameBoard.showMarks === undefined)
        throw Error(`The given game board do not contain the necessary utilities `);

    const gameMarks = gameBoard.showMarks();
    if(!gameMarks.includes(mark))
        throw Error(`Choose one of the marks in this list only: ${gameMarks}`);
    

    function choosePos(x,y){
        gameBoard.setMark(mark,x,y);
    }

    return {choosePos,name,iconUrl};
}


let displayDOM = (function(){
    
    const resultScreen = document.querySelector(".result-screen");
    const gameHeader = document.querySelector(".game-header");
    const gameScreen = document.querySelector(".game-screen");
    const slots = document.querySelectorAll(".game-grid > div");
    const headerPlayerOne = gameHeader.querySelectorAll(".player-one");
    const headerPlayerTwo = gameHeader.querySelectorAll(".player-two"); 

    function showBoard(){
        let board = gameBoard.getBoard();
        let currentIdx = 0;
        
        board.forEach((row)=>row.forEach((mark)=>{
            mark = (mark==null)?"":mark;
            slots[currentIdx].textContent = "";
            if (mark === ""){
                currentIdx++;
                return;
            }
            let markIcon = document.createElement("img");
            markIcon.classList.add("xo-icon");
            if(mark === 0){
                markIcon.src = "images/x_icon.png";
            } else {
                markIcon.src = "images/o_icon.png";
            }   
            slots[currentIdx].appendChild(markIcon);
            currentIdx++;
        }));
    }

    function showResult(status,playerObj){
        resultScreen.style.display = "flex";
        let tieSection = resultScreen.querySelector(".tie");
        let winSection = resultScreen.querySelector(".win");
        if(status == -1){
            tieSection.classList.remove("hide");
            winSection.classList.add("hide");
            return;
        }
        tieSection.classList.add("hide");
        winSection.classList.remove("hide");
        let winnerIcon = winSection.querySelector(".xo-icon");
        winnerIcon.src = playerObj.iconUrl;
        // let winnerField = winSection.querySelector(".player-name");
        // winnerField.textContent = `${playerObj.name} winner 🎉`;
    }

    function hideResult(){
        resultScreen.style.display = "none";
    }

    function showGame(){
        hideResult();
        gameHeader.classList.remove("hide");
        gameScreen.classList.remove("hide");
        togglePlayerUI();
        return;
    }

    function togglePlayerUI(currentPlayerId = 0){
        if(currentPlayerId){
            headerPlayerOne.forEach(ele=>ele.classList.add("disable-ui"));
            headerPlayerTwo.forEach(ele=>ele.classList.remove("disable-ui"));
            return;
        }
        headerPlayerTwo.forEach(ele=>ele.classList.add("disable-ui"));
        headerPlayerOne.forEach(ele=>ele.classList.remove("disable-ui"));
    }

    return {showBoard,showResult,showGame,togglePlayerUI};
})();


// Activate Game Logic

(function(){
    let playerOne = Player(0,gameBoard,"player1","images/x_icon.png");
    let playerTwo = Player(1,gameBoard,"player2","images/o_icon.png");
    let x, y;
    let players = [playerOne,playerTwo];
    let currentPlayer = 0;
    let gameGrid = document.querySelector(".game-grid");

    let gridSlotsEvent = gameGrid.addEventListener("click",(e)=>{
        if (!(e.target.dataset.col && e.target.dataset.row))
            return;
        x = +e.target.dataset.row;
        y = +e.target.dataset.col;
        try{
            players[currentPlayer].choosePos(x,y);
        }catch(error){
            console.log(error.message);
            return;
        }
        displayDOM.showBoard();
        let winner = gameBoard.checkWinner();
        if(winner == -1){
            console.log("It is a tie.");
            console.table(gameBoard.getBoard());
            displayDOM.showResult(winner);
            return 0;
        }else if(winner !== false){
            console.log(`player ${winner} are the winner.kudos`);
            console.table(gameBoard.getBoard());
            // let playerName = players[currentPlayer].name;
            displayDOM.showResult(winner,players[currentPlayer]);
            return 0;
        }
        currentPlayer = (currentPlayer+1) % players.length;  
        displayDOM.togglePlayerUI(currentPlayer);
        
    });

    const resetGame = document.querySelector(".game-footer .button");
    resetGame.addEventListener('click',(e)=>{
        gameBoard.resetBoard();
        displayDOM.showBoard();
        displayDOM.showGame();
        currentPlayer = 0;
    });
})();



// console.table(gameBoard.getBoard());
// // Tie case
// gameBoard.setMark(0,2,2);
// gameBoard.setMark(1,1,1);
// gameBoard.setMark(0,3,2);
// gameBoard.setMark(1,1,2);
// gameBoard.setMark(0,1,3);
// gameBoard.setMark(1,3,1);
// gameBoard.setMark(0,2,1);
// gameBoard.setMark(1,2,3);
// gameBoard.setMark(0,3,3);
// console.table(gameBoard.getBoard());
// console.log(gameBoard.checkWinner());

// playerOne = Player(0,gameBoard);
// playerTwo = Player(1,gameBoard);
// playerOne.choosePos(1,1);
// playerTwo.choosePos(2,1);

// console.table(gameBoard.getBoard());


