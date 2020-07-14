import React from "react";

import "./styles.css";

class DescInput extends React.Component {

    _isMounted = false;

    componentDidMount () {
        this._isMounted = true;
    }

    componentWillUnmount () {
        this._isMounted = false;
    }

    render() {
        const { name, value, onChange, placeholder, maxValueLength } = this.props;

        return (
            <div className="descContainer">
                <textarea className="descInput"
                    name={name}
                    value={value}
                    onChange={onChange}
                    type="text"
                    placeholder={placeholder} />
                <div className={maxValueLength - value.length >= 0 ? "descCharCount" : "descCharCountRed"}>
                    {maxValueLength - value.length}
                </div>
            </div>
        );
    }
}

export default DescInput;