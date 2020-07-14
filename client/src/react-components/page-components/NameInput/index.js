import React from "react";

import "./styles.css";

class NameInput extends React.Component {

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
            <div className="nameContainer">
                <input className="nameInput"
                    name={name}
                    value={value}
                    onChange={onChange}
                    type="text"
                    placeholder={placeholder} />
                <div className={maxValueLength - value.length >= 0 ? "nameCharCount" : "nameCharCountRed"}>
                    {maxValueLength - value.length}
                </div>
            </div>
        );
    }
}

export default NameInput;