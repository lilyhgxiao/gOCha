import React from "react";

import "./styles.css";

// Importing components
import StarRarityDisplay from './../StarRarityDisplay';
import StatDisplay from './../StatDisplay';

//images
import main_placeholder from './../../images/dashboard_placeholder.jpg';
import exit_icon from './../../images/exit.png';

// Importing actions/required methods
import { getUserById } from "../../actions/userhelpers";
import { getGachaById } from "../../actions/gachaHelpers";
import { uid } from "react-uid";


class CharaProfile extends React.Component {

  state = {
    gachaCreatorLoaded: false,
    gacha: null,
    creator: null
  };

  async componentDidMount() {
    const { chara } = this.props;

    const getGachaRes = getGachaById(chara.gacha);
    const getCreatorRes = getUserById(chara.creator);
    
    Promise.all([getGachaRes, getCreatorRes]).then(res => {
      console.log(res);
      this.setState({
          gacha: res[0],
          creator: res[1],
          gachaCreatorLoaded: true
      });
    }).catch((err) => {
      console.log("Error with Promise.all in CharaProfile: " + err);
    })
  }

  loadStats = () => {

  }

  render() {
    const { chara, handleExitWindowClick } = this.props;
    const { gachaCreatorLoaded } = this.state;

    return (
        <div className="darkBackground">
            <div className="charaProfWindow">
                <div className="exitWindow">
                  <img className="exitWindowButton" src={exit_icon} onClick={handleExitWindowClick}/>
                </div>
                <div className="charaInfoSection">
                  <div className="charaProfName">{chara.name}</div>
                  <img className="charaProfMainPic" src={main_placeholder} />
                  <StarRarityDisplay rarity={chara.rarity}/>
                  <div className="charaProfDesc">{chara.desc}</div>
                  <br/>
                  <table className="charaProfOrigin">
                    <tbody>
                      <tr>
                        <th>Gacha:</th>
                        <td>{ gachaCreatorLoaded ? this.state.gacha.name : ""}</td>
                      </tr>
                      <tr>
                        <th>Creator:</th>
                        <td>{ gachaCreatorLoaded ? this.state.creator.username : ""}</td>
                      </tr>
                    </tbody>
                  </table>
                  <br/>
                  { chara.stats.length > 0 ?
                    <table className="charaProfStats">
                      <tbody>
                        { chara.stats.map((stat) => {
                          return ( 
                          <tr className="charaProfStats" key={uid(stat)}>
                            <th className="charaProfStats">{stat.name}</th>
                            <td className="charaProfStats"><StatDisplay value={stat.value}/></td>
                          </tr>
                          )})
                        }
                      </tbody>
                    </table> : null
                  }
                  <br/>
                </div>
            </div>
        </div>
    );
  }
}

export default CharaProfile;