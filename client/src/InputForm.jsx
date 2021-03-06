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

            <button type="submit" className="submit form-entry" disabled={isLoading}>
                {isLoading && (
                    <div class="spinner-border spinner-grow-sm mr-1" role="status">
                        <span class="sr-only">Loading...</span>
                    </div>
                )}
                Submit

            </button>
        </form>
    );
}

export { InputForm };