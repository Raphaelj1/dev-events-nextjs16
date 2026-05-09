import cloudinary from '@/lib/cloudinary';
import { Event } from '@/database';
import connectDB from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
	try {
		await connectDB();

		const formData = await req.formData();

		let event;

		try {
			event = Object.fromEntries(formData.entries());
		} catch (e) {
			return NextResponse.json({ message: 'Invalid JSON data format' }, { status: 400 });
		}

		const imageInput = formData.get('image');

		if (!imageInput) {
			return NextResponse.json({ message: 'Image file is required' }, { status: 400 });
		}

		const tags = JSON.parse(formData.get('tags') as string);
		const agenda = JSON.parse(formData.get('agenda') as string);

		if (typeof imageInput === 'string') {
			event.image = imageInput;
		} else {
			const arrayBuffer = await imageInput.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);

			const uploadResult = await new Promise((resolve, reject) => {
				cloudinary.uploader
					.upload_stream(
						{ resource_type: 'image', folder: 'dev_events' },
						(error, results) => {
							if (error) return reject(error);

							resolve(results);
						},
					)
					.end(buffer);
			});

			event.image = (uploadResult as { secure_url: string }).secure_url;
		}

		const createdEvent = await Event.create({ ...event, tags, agenda });

		return NextResponse.json(
			{ message: 'Event created successfully', event: createdEvent },
			{ status: 201 },
		);
	} catch (e) {
		console.error(e);
		return NextResponse.json(
			{
				message: 'Event Creation Failed',
				error: e instanceof Error ? e.message : 'unknown',
			},
			{ status: 500 },
		);
	}
}

export async function GET() {
	try {
		await connectDB();

		const events = await Event.find().sort({ createdAt: -1 });

		return NextResponse.json(
			{ message: 'Events fetched successfully', events },
			{ status: 200 },
		);
	} catch (e) {
		return NextResponse.json({ message: 'Event fetching failed', error: e }, { status: 500 });
	}
}
