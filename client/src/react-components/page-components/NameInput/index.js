import React from "react";

import "./styles.css";

class NameInput extends React.Component {

    _isMounted = false;

    constructor(props) {
        super(props);
    }

    componentDidMount () {
        this._isMounted = true;
    }

    componentWillUnmount () {
        this._isMounted = false;
    }

    render() {
        const { name, value, onChange, placeholder, maxNameLength } = this.props;

        return (
            <div className="nameContainer">
                <input className="nameInput"
                    name={name}
                    value={value}
                    onChange={onChange}
                    type="text"
                    placeholder={placeholder} />
                <div className={maxNameLength - value.length > 0 ? "charCount" : "charCountRed"}>
                    {maxNameLength - value.length}
                </div>
            </div>
        );
    }
}

export default NameInput;