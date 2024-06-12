// component that takes in a trip name and time and creates a countdown timer

import { useState, useEffect } from "react";
import { RichText } from "@wordpress/block-editor";
import { Popover, Button, TextControl } from "@wordpress/components";
import { edit } from "@wordpress/icons";

export default function TripCounter({
	tripName,
	tripTime,
	setTripName,
	updateTripTime,
}) {
	const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(tripTime));
	const [isInvisible, setIsInvisble] = useState(true);
	const toggleVisible = () => {
		setIsInvisble((state) => !state);
	};
	const [secondsLeft, setSecondsLeft] = useState(
		calculateSecondsLeft(tripTime),
	);
	const encouragement = "Let's go!";

	useEffect(() => {
		const interval = setInterval(() => {
			setTimeLeft(calculateTimeLeft(tripTime));
			setSecondsLeft(calculateSecondsLeft(tripTime));
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

	return (
		<div class="CountdownPage">
			<RichText
				tagName="h2"
				value={tripName}
				onChange={setTripName}
				withoutInteractiveFormatting
				placeholder="Trip name"
				allowedFormats={[]}
			/>
			<div class={"timeInfo" + getTimeInfoColorClass(secondsLeft)}>
				<div>Out the door at {niceHumanTime(tripTime)}</div>
				<div style={{ position: "relative" }}>
					<span>{timeLeft} LEFT!</span>
					{
						<Button variant="tertiary" icon={edit} onClick={toggleVisible}>
							{!isInvisible && (
								<Popover onClose={toggleVisible}>
									<div className="time-popup-styles">
										<TextControl
											label="Trip Time"
											value={tripTime}
											placeholder="Enter trip time"
											onChange={updateTripTime}
											type="time"
										/>
									</div>
								</Popover>
							)}
						</Button>
					}
				</div>
			</div>
			<div class="otherStuff">
				<div className={encouragementAreaClasses()}>{encouragement}</div>
			</div>
		</div>
	);
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

// This could use consolidation with the same function in TripCounter.js
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
