class VoterStatus {

  constructor(inUserID){
    console.log(`VoterStatus constructor inUserID ${inUserID}`);

    this.userID = inUserID;
    this.resetPollChoice();
  }// constructor()
  
  get userID(){
    return this._userID;
  }

  set userID(inUserID){
    console.log(`VoterStatus constructor set userID ${inUserID}`);

    this._userID = inUserID;
  }

  get pollChoice(){
    return this._pollChoice;
  }

  set pollChoice(pollChoice){
    this._pollChoice = pollChoice;
  }

  resetPollChoice(){
    this.pollChoice   = '';
  }
  
}// class VoterStatus



module.exports = {
  VoterStatus : VoterStatus
}
