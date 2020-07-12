import React from "react";
import { uid } from "react-uid";

import "./styles.css";

import { pageRange } from "../../../constants";

class PageNumNav extends React.Component {

    withinRange = (index) => {
        const { num, currPageNum } = this.props;
        if (currPageNum === 0 && index < pageRange) {
            return true;
        } else if (currPageNum === num - 1 && index > num - pageRange) {
            return true;
        } else if (index > currPageNum - Math.ceil(pageRange / 2) 
                    && index < currPageNum + Math.ceil(pageRange / 2)) {
            return true;
        } else {
            return false;
        }
    }

    render() {
        // the filtered states are now on this.state
        const { num, currPageNum, handleClick } = this.props;
        let rightEllipses = false;
        let leftEllipses = false;

        return (
            <div className="pageNumNavContainer">
                {new Array(num).fill(0).map((zero, index) => {
                    if (index === 0 || index === num - 1 || this.withinRange(index)) {
                        return (<span className="pageNumLink"
                            key={uid(index)}
                            onClick={() => handleClick(index)}>
                            {" " + (index + 1) + " "}
                        </span>);
                    } else {
                        if ((index < currPageNum && !leftEllipses)) {
                            leftEllipses = true;
                            return (<span className="pageNumEllipses"
                                key={uid(index)}>
                                {" ... "}
                            </span>);
                        }
                        if (index > currPageNum && !rightEllipses) {
                            rightEllipses = true;
                            return (<span className="pageNumEllipses"
                                key={uid(index)}>
                                {" ... "}
                            </span>);
                        }
                    }
                })}
            </div>
        );
    }
}

export default PageNumNav;