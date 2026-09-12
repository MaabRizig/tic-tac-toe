

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

    function showBoard(){
        return JSON.parse(JSON.stringify(gameBoardArr));
    }

    function resetBoard(){
        gameBoardArr = Array.from({length:rows},()=>Array.from({length:cols},()=>undefined));
    }

    function showMarks(){
        return JSON.parse(JSON.stringify(marks));
    }
    return {setMark,checkWinner,showBoard,resetBoard,showMarks};
})();


function Player(mark,gameBoard){
    
    if(gameBoard.setMark === undefined || gameBoard.showMarks === undefined)
        throw Error(`The given game board do not contain the necessary utilities `);

    const gameMarks = gameBoard.showMarks();
    if(!gameMarks.includes(mark))
        throw Error(`Choose one of the marks in this list only: ${gameMarks}`);
    

    function choosePos(x,y){
        gameBoard.setMark(mark,x,y);
    }

    return {choosePos};
}



function playRound(){
    let playerOne = Player(0,gameBoard);
    let playerTwo = Player(1,gameBoard);
    let x, y;
    let players = [playerOne,playerTwo];
    let currentPlayer = 0;

    while(true){
        [x,y] = prompt("choose a position").split(",").map(char=>+char);
        try{
            players[currentPlayer].choosePos(x,y);
        }catch(error){
            console.log(error.message);
            continue;
        }

        let winner = gameBoard.checkWinner();
        if(winner == -1){
            console.log("It is a tie.");
            console.table(gameBoard.showBoard());
            return 0;
        }else if(winner !== false){
            console.log(`player ${winner} are the winner.kudos`);
            console.table(gameBoard.showBoard());
            return 0;
        }
        currentPlayer = (currentPlayer+1) % players.length;  
    }
}


playRound();

// console.table(gameBoard.showBoard());
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
// console.table(gameBoard.showBoard());
// console.log(gameBoard.checkWinner());

// playerOne = Player(0,gameBoard);
// playerTwo = Player(1,gameBoard);
// playerOne.choosePos(1,1);
// playerTwo.choosePos(2,1);

// console.table(gameBoard.showBoard());


