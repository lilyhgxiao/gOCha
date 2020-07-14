import React from "react";

import "./styles.css";

class CharaPhraseInput extends React.Component {

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
        const { headerText, name, value, onChange, placeholder, maxValueLength } = this.props;

        return (
            <tr>
                <th>{headerText}</th>
                <td>
                    <textarea className="charaPhraseInput"
                        name={name}
                        value={value}
                        onChange={onChange}
                        type="text"
                        placeholder={placeholder} />
                    <div className={maxValueLength - value.length >= 0 ? "phraseCharCount" : "phraseCharCountRed"}>
                        {maxValueLength - value.length}
                    </div>
                </td>
            </tr>
        );
    }
}

export default CharaPhraseInput;