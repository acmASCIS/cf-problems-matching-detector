import { Component } from "react";

class RenderLinks extends Component {

    render() {
        return (
            <ul className="theList">
                {
                    this.props.links.map((link, index) => {
                        return <li key={index}>{link}</li>
                    })
                }
            </ul>
        );
    }
};

export default RenderLinks;