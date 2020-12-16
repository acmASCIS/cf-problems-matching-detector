import React, { useState } from 'react';

function InputForm({ onSubmit, isLoading }) {

    const [numOfPolygonPages, setNumOfPolygonPages] = useState('');
    const [problemsId, setProblemsId] = useState('');
    const [matchingPercentageThreshold, setMatchingPercentageThreshold] = useState('');

    const submitHandler = (event) => {
        event.preventDefault();
        onSubmit({
            problemsId, numOfPolygonPages: +numOfPolygonPages,
            matchingPercentageThreshold: +matchingPercentageThreshold
        });
    };

    const createOnChangeHandler = setter => event => {
        setter(event.target.value);
    };

    return (
        <form classname='form' onSubmit={submitHandler}>
            <div>
                <input
                    className="input form-entry"
                    id="numOfPolygonPages"
                    placeholder="Enter Number of Polygon Pages"
                    value={numOfPolygonPages}
                    onChange={createOnChangeHandler(setNumOfPolygonPages)}
                />
            </div>

            <div>
                <textarea
                    className="comma-separated-input form-entry"
                    id="problem-id"
                    placeholder="Enter Problem ID"
                    value={problemsId}
                    onChange={createOnChangeHandler(setProblemsId)}
                />
            </div>

            <div>
                <input
                    className="input form-entry"
                    id="matching-percentage"
                    placeholder="Enter Matching Percentage Threshold"
                    value={matchingPercentageThreshold}
                    onChange={createOnChangeHandler(setMatchingPercentageThreshold)}
                />
            </div>
            <button type="submit" className="submit form-entry" disabled={isLoading}>

                Submit

            </button>
        </form>
    );
}

export { InputForm };