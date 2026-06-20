import EventCard from '@/components/EventCard';
import ExploreBtn from '@/components/ExploreBtn';
import { IEvent } from '@/database';
import { cacheLife } from 'next/cache';
// import { events } from '@/lib/constants';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL as string;

const Home = async () => {
	'use cache';
	cacheLife('hours');

	let events: IEvent[] = [];

	const response = await fetch(`${BASE_URL}/api/events`);

	if (response.ok) {
		const data = await response.json();
		events = data.events || [];
	}

	return (
		<section>
			<h1 className="text-center">
				The Hub for Every Dev <br /> Event You Can't Miss
			</h1>
			<p className="text-center mt-5">
				Hackatons, Meetups, and Conferences, All in One Place
			</p>

			<ExploreBtn />

			<div className="mt-20 space-y-7">
				<h3>Featured Events</h3>

				<ul className="events">
					{events &&
						events.length > 0 &&
						events.map((event: IEvent, index: number) => (
							<li key={index} className="list-none">
								<EventCard {...event} />
							</li>
						))}
				</ul>
			</div>
		</section>
	);
};

export default Home;
