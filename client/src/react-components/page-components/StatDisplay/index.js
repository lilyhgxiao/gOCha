import React from "react";
import { uid } from "react-uid";

import "./styles.css";

//images
/**TODO: replace image placeholders */
import stat_filled from './../../../images/stat_filled.png';
import stat_unfilled from './../../../images/stat_unfilled.png';

class StatDisplay extends React.Component {

	handleClick = (value) => {
		const { edit, index, page } = this.props;

		if (edit) {
			const stats = page.state.stats;
			if (stats[index].value !== value + 1) {
				stats[index].value = value + 1;
			} else {
				stats[index].value = 0;
			}
			
			page.setState({
				stats: stats
			});
		}
	}

	render() {
		const statIcons = [1, 1, 1, 1, 1];
		const { value } = this.props;
		
		return (
			<div className="statDisplayContainer">
				{statIcons.map((icon, index) => {
					if (index + 1 <= value) {
						return (<img className="statFilled"
							src={stat_filled} key={uid(index)}
							alt={'Filled Stat Icon'}
							onClick={this.handleClick.bind(this, index)} />);
					} else {
						return (<img className="statUnfilled"
							src={stat_unfilled} key={uid(index)}
							alt={'Unfilled Stat Icon'}
							onClick={this.handleClick.bind(this, index)} />);
					}
				})
				}
			</div>
		);
	}
}

export default StatDisplay;