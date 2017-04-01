import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {Progress} from 'thousanday-react';
class Combater extends Component {
    constructor(props) {
		super(props);
		this.state = {
            //store all pilots in current solar system in array
			allPilot: "",
            //store all pilots in fleet in array
            fleetPilot: "",
            //how to count friends pilots in fleet
            countFleet: "only",
            //store info on start analysis button
            analysis: "Start Combat Analysis",
            //display analysis result or not
            showInfo: false,
            //store all pilots info in current solar system
            pilotsInfo: [],
            //store all friends index of pilotsInfo
            friendIndex: [],
            //store all enemy index of pilotsInfo
            enemyIndex: [],
            //how to evaluate combat chance
            checkEval: "all",
            //take pilots numbers into consideration or not
            checkConsider: "yes",
            //remove pilots in same alliance from enemy or not
            checkAlliance: "yes",
            //store pilots not in fleet but not considered as enmey
            whiteList: [],
            //store all enemy alliance id
            enemyAlliance: []
		};
	}
    //get raw date for all pilots in system
    addAll(event) {
		this.setState({allPilot: event.target.value});
    }
    //get raw data for all pilots in fleet
    addFleet(event) {
        this.setState({fleetPilot: event.target.value});
    }
    //how to count the strength of your fleet
    changeFleet(event) {
        this.setState({countFleet: event.target.value});
    }
    //analysis odds of winning
    startAnalysis() {
        //must paste names in current system
        if (this.state.allPilot == "") {
            this.setState({analysis: "Please fill in form on the left"});
        }
        //must paste names in current fleet
        else if (this.state.fleetPilot == "") {
            this.setState({analysis: "Please fill in form on the right"});
        }
        //get two lists of pilots name start analysis
        else {
            //turn raw pilots name in system to array
            let pilotsName = escape(this.state.allPilot).split("%0A");
            //turn raw pilots name in fleet to array
            let friendsName = escape(this.state.fleetPilot).split("%0A");
            //If user want count all pilots in fleet as strength
            if (this.state.countFleet == "all") {
                for (let i = 0; i < friendsName.length; i++) {
                    if (pilotsName.indexOf(friendsName[i]) == -1) {
                        pilotsName.push(friendsName[i]);
                    }
                }
            }
            //store all pilots ids
            let pilotsId = [];
            //store all pilots info
            let pilotsInfo = [];
            //ajax request loop trough all pilots in current system by name to get id and info
            for (let i = 0; i < pilotsName.length; i++) {
                let xmlhttp = new XMLHttpRequest();
                xmlhttp.open("GET", "https://api.eveonline.com/eve/CharacterID.xml.aspx?names=" + pilotsName[i], false);
                xmlhttp.send();
                let result = xmlhttp.responseText;
                let div = window.document.createElement('div');
                div.innerHTML = result;
                //get pilot id inside text
                if (div.getElementsByTagName("row")[0].getAttribute("CharacterID") && div.getElementsByTagName("row")[0].getAttribute("CharacterID") != "") {
                    pilotsId[i] = div.getElementsByTagName("row")[0].getAttribute("CharacterID");
                } else {
                    pilotsId[i] = null;
                }
                div = null;
                //get pilot info by pilot id
                if (pilotsId[i]) {
                    let xmlhttp1 = new XMLHttpRequest();
                    xmlhttp1.open("GET", "https://zkillboard.com/api/stats/characterID/" + pilotsId[i] + "/", false);
                    xmlhttp1.send();
                    pilotsInfo[i] = JSON.parse(xmlhttp1.responseText);
                } else {
                    pilotsInfo[i] = null;
                }
            }
            //Indicate all friend pilot index in all pilots list
            let friendIndex = [];
            //Indicate all enemy pilot index in all pilots list
            let enemyIndex = [];
            //loop through all pilots name in current system
            for (let j = 0; j < pilotsName.length; j++) {
                //If pilot not in fleet list, treat as enemy
                if (friendsName.indexOf(pilotsName[j]) === -1) {
                    enemyIndex.push(j);
                }
                //Treat pilot inside fleet list as friend
                else {
                    friendIndex.push(j);
                }
            }
            //store all friend, enemy alliance id
            let friendAlliance = [], enemyAlliance = [];
            //loop all friends pilots info, get their alliance id
            for (let k = 0; k < friendIndex.length; k++) {
				if (pilotsInfo[friendIndex[k]].info != null) {
					friendAlliance.push(pilotsInfo[friendIndex[k]].info.allianceID);
				}
            }
            //loop all enemy, get their alliance id
            for (let l = 0; l < enemyIndex.length; l++) {
				if (pilotsInfo[enemyIndex[l]].info != null) {
					enemyAlliance.push(pilotsInfo[enemyIndex[l]].info.allianceID);
				}
            }
            //store pilots ignored for enemy check
            let whiteList = [];
            for (let m = 0; m < enemyAlliance.length; m++) {
                if (friendAlliance.indexOf(enemyAlliance[m]) !== -1) {
                    whiteList.push(m);
                }
            }
            //close textarea panel, show odds to win panel
            this.setState({pilotsInfo: pilotsInfo, showInfo: true, friendIndex: friendIndex, enemyIndex: enemyIndex, whiteList: whiteList, enemyAlliance: enemyAlliance});
        }
    }
    //close odds to win panel, back to textarea panel
    endAnalysis() {
        this.setState({allPilot: "", fleetPilot: "", analysis: "Start Combat Analysis", showInfo: false, pilotsInfo: [], friendIndex: [], enemyIndex: [], whiteList: [], enemyAlliance: []});
    }
    //Let user change options for how to eval combat ability
    changeEval(event) {
        this.setState({checkEval: event.target.value});
    }
    //let user change option for consider pilots number or not
    changeConsider(event) {
        this.setState({checkConsider: event.target.value});
    }
    //let user change option for consider whitelist
    changeAlliance(event) {
        this.setState({checkAlliance: event.target.value});
    }
	render() {
        //store html for display
        let fetch;
        //html display for textarea panel
        if (!this.state.showInfo) {
            fetch = (
                <section id="main-fetch">
                    <section id="fetch-column">
                        <h2>Paste all pilots in current solar here</h2>
                        <textarea className="form-control" value={this.state.allPilot} onChange={this.addAll.bind(this)}></textarea>
                    </section>
                    <section id="fetch-column">
                        <h2>Paste all pilots in your fleet here</h2>
                        <textarea className="form-control" value={this.state.fleetPilot} onChange={this.addFleet.bind(this)}></textarea>
                    </section>
                    <div id="fetch-option">
                        <h5>How to count pilots in your fleet:</h5>
                        <select className="form-control" value={this.state.countFleet} onChange={this.changeFleet.bind(this)}>
                            <option value="only">Pilots in current solar</option>
                            <option value="all">All pilots in fleet</option>
                        </select>
                    </div>
                    <input type="button" className="btn btn-default" value={this.state.analysis} onClick={this.startAnalysis.bind(this)} />
                </section>
            );
        }
        //html display for odds to win panel
        else {
            //friend and enemy combat data including gang combat and solo combat
            let friendKill = 0, friendLoss = 0, enemyKill = 0, enemyLoss = 0;
            //friend and enemy combat data, solo combat only
            let friendSoloKill = 0, friendSoloLoss = 0, enemySoloKill = 0, enemySoloLoss = 0;
            //loop through all friend index
            for (let i = 0; i < this.state.friendIndex.length; i++) {
                //for friend destroyed ships before increase data
                if (this.state.pilotsInfo[this.state.friendIndex[i]].shipsDestroyed) {
                    friendKill += parseInt(this.state.pilotsInfo[this.state.friendIndex[i]].shipsDestroyed);
                    friendSoloKill += parseInt(this.state.pilotsInfo[this.state.friendIndex[i]].soloKills);
                }
                //for friend lost ships before increase data
                if (this.state.pilotsInfo[this.state.friendIndex[i]].shipsLost) {
                    friendLoss += parseInt(this.state.pilotsInfo[this.state.friendIndex[i]].shipsLost);
                    friendSoloLoss += parseInt(this.state.pilotsInfo[this.state.friendIndex[i]].soloLosses);
                }
            }
            //loop through all enemy index
            for (let j = 0; j < this.state.enemyIndex.length; j++) {
                //for enemy distroyed ships before increase data, ignore whitelist
                if (this.state.pilotsInfo[this.state.enemyIndex[j]].shipsDestroyed && this.state.checkAlliance == "no") {
                    enemyKill += parseInt(this.state.pilotsInfo[this.state.enemyIndex[j]].shipsDestroyed);
                    enemySoloKill += parseInt(this.state.pilotsInfo[this.state.enemyIndex[j]].soloKills);
                }
                //consider whitelist
                else if (this.state.pilotsInfo[this.state.enemyIndex[j]].shipsDestroyed && this.state.checkAlliance == "yes") {
                    if (this.state.whiteList.indexOf(j) === -1) {
                        enemyKill += parseInt(this.state.pilotsInfo[this.state.enemyIndex[j]].shipsDestroyed);
                        enemySoloKill += parseInt(this.state.pilotsInfo[this.state.enemyIndex[j]].soloKills);
                    }
                }
                //for enemy lost ships before increase data ignore whitelist
                if (this.state.pilotsInfo[this.state.enemyIndex[j]].shipsLost && this.state.checkAlliance == "no") {
                    enemyLoss += parseInt(this.state.pilotsInfo[this.state.enemyIndex[j]].shipsLost);
                    enemySoloLoss += parseInt(this.state.pilotsInfo[this.state.enemyIndex[j]].soloLosses);
                }
                //consider whitelist
                else if (this.state.pilotsInfo[this.state.enemyIndex[j]].shipsLost && this.state.checkAlliance == "yes") {
                    if (this.state.whiteList.indexOf(j) === -1) {
                        enemyLoss += parseInt(this.state.pilotsInfo[this.state.enemyIndex[j]].shipsLost);
                        enemySoloLoss += parseInt(this.state.pilotsInfo[this.state.enemyIndex[j]].soloLosses);
                    }
                }
            }
            //store info for odds to win
            let generalOdd, enemyOdd;
            switch (this.state.checkEval) {
                //default, calc gang and solo combat together
                case "all":
                    generalOdd = (friendKill / (friendKill + friendLoss)) * 100;
                    enemyOdd = (enemyKill / (enemyKill + enemyLoss)) * 100;
                    break;
                //option, only count solo combat
                case "solo":
                    generalOdd = (friendSoloKill / (friendSoloKill + friendSoloLoss)) * 100;
                    enemyOdd = (enemySoloKill / (enemySoloKill + enemySoloLoss)) * 100;
                    break;
                //option, gang and solo weight 50% each
                default:
                    let friendGangKill = friendKill - friendSoloKill,
                        friendGangLoss = friendLoss - friendSoloLoss,
                        enemyGangKill = enemyKill - enemySoloKill,
                        enemyGangLoss = enemyLoss - enemySoloLoss;
                    generalOdd = (friendGangKill  / (friendGangKill + friendGangLoss)) * 50 + (friendSoloKill / (friendSoloKill + friendSoloLoss)) * 50;
                    enemyOdd = (enemyGangKill  / (enemyGangKill + enemyGangLoss)) * 50 + (enemySoloKill / (enemySoloKill + enemySoloLoss)) * 50;
                    break;
            }
            //store evaluate point
            let friendPoint, enemyPoint;
            //take numbers of pilots into consideration
            switch (this.state.checkConsider) {
                //default, consider number
                case "yes":
                    friendPoint = generalOdd * this.state.friendIndex.length;
                    //consider whitelist
                    if (this.state.checkAlliance == "yes") {
                        enemyPoint = enemyOdd * (this.state.enemyIndex.length - this.state.whiteList.length);
                    }
                    //don't consider whitelist
                    else {
                        enemyPoint = enemyOdd * this.state.enemyIndex.length;
                    }
                    break;
                //option, ignore number
                default:
                    friendPoint = generalOdd;
                    enemyPoint = enemyOdd;
                break;
            }
            //Final odds of win in this combat
            let battleOdd = (friendPoint / (friendPoint + enemyPoint)) * 100;
            //store number of enemies
            let enemyTotal = 0;
            //consider whitelist
            if (this.state.checkAlliance == "yes") {
                enemyTotal = this.state.enemyIndex.length - this.state.whiteList.length;
            }
            //not consider enemylist
            else {
                enemyTotal = this.state.enemyIndex.length;
            }
            //store all enemy alliance ids
            let targetAlliance = [];
            //loop through enemy alliance
            for (let i = 0; i < this.state.enemyAlliance.length; i++) {
                //ignore whitelist, get no duplicated alliance ids
                if (this.state.checkAlliance == "no" && targetAlliance.indexOf(this.state.enemyAlliance[i]) === -1) {
                    targetAlliance.push(this.state.enemyAlliance[i]);
                }
                //consider whitelist, get no duplicated alliance ids
                else if (this.state.checkAlliance == "yes" && targetAlliance.indexOf(this.state.enemyAlliance[i]) === -1 && this.state.whiteList.indexOf(i) === -1) {
                    targetAlliance.push(this.state.enemyAlliance[i]);
                }
            }
            //store enemy alliance pilots number
            let targetNumber = [];
            //html for show enemy alliance target
            let targets = [];
            //loop through target alliance list
            for (let j = 0; j < targetAlliance.length; j++) {
                //loop through enemy alliance list
                for (let k=0; k < this.state.enemyAlliance.length; k++) {
                    //increase number when alliance id is the same
                    if (this.state.enemyAlliance[k] == targetAlliance[j]) {
                        if (!targetNumber[j]) {
                            targetNumber[j] = 1;
                        } else {
                            targetNumber[j] += 1;
                        }
                    }
                }
				let name = "Unknow";
				if (targetAlliance[j] != 0 ) {
					//use alliance id to get alliance name
					let xmlhttp = new XMLHttpRequest();
					xmlhttp.open("GET", "https://crest-tq.eveonline.com/alliances/" + targetAlliance[j] + "/", false);
					xmlhttp.send();
					let result = JSON.parse(xmlhttp.responseText);
					name = result.name;
				}
                targets[j] = (
                    <div className="screen-target" key={j}>
                        <img src={"https://imageserver.eveonline.com/Alliance/" + targetAlliance[j] + "_128.png"} />
                        <h5>{targetNumber[j]} Pilots FROM {name}</h5>
                    </div>
                )
            }
            fetch = (
                <section id="main-display">
                    <section id="fetch-screen">
                        <h2>Screener</h2>
                        <div className="screen-option">
                            <h5>How to evaluate:</h5>
                            <select className="form-control" value={this.state.checkEval} onChange={this.changeEval.bind(this)}>
                                <option value="all">Solo + Gang together</option>
                                <option value="solo">Solo only</option>
                                <option value="half">Solo + Gang 50/50</option>
                            </select>
                        </div>
                        <div className="screen-option">
                            <h5>Take pilots number into consideration:</h5>
                            <select className="form-control" value={this.state.checkConsider} onChange={this.changeConsider.bind(this)}>
                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                            </select>
                        </div>
                        <div className="screen-option">
                            <h5>Exclude pilots from same alliance:</h5>
                            <select className="form-control" value={this.state.checkAlliance} onChange={this.changeAlliance.bind(this)}>
                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                            </select>
                        </div>
                        <div className="screen-option">
                            <h5>Your enemy come from alliances:</h5>
                            {targets}
                        </div>
                    </section>
                    <section id="fetch-column">
                        <div className="column-chart">
                            <h3 id="chart-vs">
                                Our pilots {this.state.friendIndex.length} vs Enemy pilots {enemyTotal}
                            </h3>
                        </div>
                        <div className="column-chart">
                            <h3>Our odds of winning in general:</h3>
                            <Progress progress={generalOdd} max="100" />
                        </div>
                        <div className="column-chart">
                            <h3>Enemy odds of winning in general:</h3>
                            <Progress progress={enemyOdd} max="100" />
                        </div>
                        <div className="column-chart">
                            <h3 id="chart-current">Our odds of winning in current situation:</h3>
                            <Progress progress={battleOdd} max="100" />
                        </div>
                    </section>
                    <input type="button" className="btn btn-default" value="Back" onClick={this.endAnalysis.bind(this)} />
                </section>
            );
        }
		return (
            <div>
                <header id="header">
                    <h1>EVE-COMBATER</h1>
                    <h2>Our journey is the ocean of stars</h2>
                </header>
    			<main id="main">
                    <a className="github-button" href="https://github.com/byn9826/eve-combater" data-icon="octicon-star" data-style="mega" aria-label="Star byn9826/eve-combater on GitHub">Star</a>
                    {fetch}
                    <h5 id="main-notice">
                        * The analysis process takes time, please wait patientlly. Do not use it for battle in large scale.
                    </h5>
    			</main>
                <footer id="footer">
                    <h5>
                        <a href="https://github.com/byn9826">Author: baozier</a>
                    </h5>
                    <h5>API from EVE online and zkillboard</h5>
                </footer>
            </div>
		);
	}
}
ReactDOM.render(<Combater />, document.getElementById('root'));
