// component that takes in a trip name and time and creates a countdown timer

import { useState, useEffect } from "react";

export default function TripCounter({ tripName, tripTime }) {
	const [newTaskText, setNewTaskText] = useState('');
    const [tasks, setTasks] = useState([]);
	const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(tripTime));
	const [secondsLeft, setSecondsLeft] = useState(
		calculateSecondsLeft(tripTime),
	);
	const [encouragement, setEncouragement] = useState(calculateEncouragement(secondsLeft));

	useEffect(() => {
		const interval = setInterval(() => {
			// Set new time variables to account for reacts asynchronous state updates
			const newTimeLeft = calculateTimeLeft(tripTime);
			const newSecondsLeft = calculateSecondsLeft(tripTime);

			setTimeLeft(newTimeLeft);
			setSecondsLeft(newSecondsLeft);

			// Generate message based on secondsLeft which is calculated above
			setEncouragement(calculateEncouragement(newSecondsLeft));
		}, 500);
		return () => {
			clearInterval(interval);
		};
	}, [tripTime]);

	function encouragementAreaClasses() {
		const classes = ["encouragementArea"];
		if (secondsLeft < 60) {
			classes.push("encouragementAreaRed");
		}
		if (secondsLeft < 300) {
			classes.push("encouragementAreaYellow");
		}
		if (secondsLeft >= 300) {
			classes.push("encouragementAreaGreen");
		}

		return classes.join(" ");
	}

	function checkEnterKey(event) {
        if (event.key && event.key === 'Enter') {
            addNewTask();
        }
    }

    function addNewTask() {
        setTasks([...tasks, {text: newTaskText, done: false}]);
        setNewTaskText('');
    }

    function changeCheckbox(event) {
        const updatedTasks = Array.from(tasks);
        const index = event.target.id.match(/\d/)[0];

        updatedTasks[index].done = event.target.checked;
        setTasks(updatedTasks);
    }

    const listItems = tasks.map((task, index) => {
        let itemClass = "taskItem";
        if (task?.done) {
            itemClass += " done";
        }

        const id = `taskCheckbox_${index}`;

        return (
            <li className={itemClass} key={index}>
                <input
                    type="checkbox"
                    id={id}
                    onChange={changeCheckbox}
                    checked={task.done}
                />
                <label htmlFor={id}>{task.text}</label>
            </li>
        );
    });

	return (
		<div className="CountdownPage">
			<h2>{tripName}</h2>
			<div className={"timeInfo" + getTimeInfoColorClass(secondsLeft)}>
				<div>Out the door at {niceHumanTime(tripTime)}</div>
				<div>{timeLeft} LEFT!</div>
			</div>
			<div className="otherStuff">
                <div>
                    <h2>Things Left To Do</h2>
                </div>
                <div>
                    <ul>
                        {listItems}
                    </ul>
                </div>

                <div>
                    <input
                        className="newTask"
                        placeholder="Add tasks here"
                        value={newTaskText}
                        onChange={e => setNewTaskText(e.target.value)}
                        onKeyDown={checkEnterKey}
                    />
                    <button onClick={addNewTask}>+</button>
                </div>
                <div className={encouragementAreaClasses()}>
                    {encouragement}
                </div>
            </div>
        </div>
	);
}

function calculateEncouragement(secondsLeft) {
	// If less than 5 minutes
	if (secondsLeft < 60 * 5) {
		return "Time to go!";
	}
	// If between 5 and 10 minutes
	else if (secondsLeft < 60 * 10 ) {
		return "Almost time to leave!";
	}
	else {
		return "Let's go!";
	}
}

function calculateSecondsLeft(time) {
	const departureTime = new Date();
	const currentTime = new Date();

	const [hours, minutes] = time.split(":");

	departureTime.setHours(hours);
	departureTime.setMinutes(minutes);
	departureTime.setSeconds(0);

	return Math.floor((departureTime - currentTime) / 1000); // millis to seconds
}

function getTimeInfoColorClass(secondsLeft) {
	if (secondsLeft < 60) {
		return " timeInfoRed";
	} else if (secondsLeft < 300) {
		return " timeInfoYellow";
	} else {
		return " timeInfoGreen";
	}
}

function niceHumanTime(time) {
	const now = new Date();

	const [hours, minutes] = time.split(":");

	now.setHours(hours);
	now.setMinutes(minutes);

	return now.toLocaleString("en-us", {
		hour: "numeric",
		minute: "numeric",
		hour12: true,
	});
}

// This could use consolidation with the same funciton in preview.js
function calculateTimeLeft(time) {
	const now = new Date();
	const then = new Date();

	const [hours, minutes] = time.split(":");

	// These variables could be globalized in order to be accessible to all files, and replace raw numerical seconds values for readability
	const hourInSeconds = 3600;
	const minuteInSeconds = 60;

	now.setHours(hours);
	now.setMinutes(minutes);
	now.setSeconds(0);

	let secondsLeft = (now - then) / 1000; // millis

	// To avoid negative overflow being displayed, set secondsLeft to 0 if less than 0
	if (secondsLeft < 0) {
		secondsLeft = 0;
	}
	// If at least 1 hour left in seconds, display the time in hour:minute format, otherwise display time in minute:second format
	else if (secondsLeft > 3600) {
		// Divide secondsLeft by 3600 to get hours left
		let hours = Math.floor(secondsLeft / hourInSeconds);
		// Get remainder of seconds left after diving by hour then divide by 60 to get minutes left
		let minutes = Math.floor((secondsLeft % hourInSeconds) / minuteInSeconds);
		let hourString = hours === 1 ? 'HOUR' : 'HOURS';
		let minuteString = minutes === 1 ? 'MINUTE' : 'MINUTES';

		return `${hours} ${hourString} AND ${minutes} ${minuteString}`;
	}
	else if (secondsLeft > 60) {
		let minutes = Math.floor(secondsLeft / minuteInSeconds);
		let seconds = Math.floor(secondsLeft % minuteInSeconds);
		let minuteString = minutes === 1 ? 'MINUTE' : 'MINUTES';
		let secondString = seconds === 1 ? 'SECOND' : 'SECONDS';

		return `${minutes} ${minuteString} AND ${seconds.toString().padStart(2, "0")} ${secondString}`;
	}

	return `${secondsLeft} SECONDS`;
}
