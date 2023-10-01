export const featuredEventsData = [
  {
    title: 'Tech Summit 2023',
    description:
      "Join us for the largest tech summit of the year. Explore the latest trends in technology, attend insightful sessions from industry experts, and network with like-minded professionals. Don't miss this opportunity to gain valuable knowledge and expand your tech network.",
    venue: 'Convention Center, Downtown',
    location: {
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
    },
    eventType: 'offline',
    date: new Date('2023-10-15T09:00:00Z'),
    registrationDeadline: new Date('2023-10-10T00:00:00Z'),
    organizer: {
      logo: 'https://cdn.iconscout.com/icon/free/png-256/free-react-1-282599.png?f=webp',
    }, // Replace with an actual ObjectId
    slug: 'tech-summit-2023',
    attendees: ['AttendeeID1', 'AttendeeID2'], // Replace with actual User ObjectIds
    tags: ['Technology', 'Conference', 'Networking'],
    imageUrl:
      'https://organiser.org/wp-content/uploads/2022/11/1667907259236.jpg', // Replace with image URLs
    eventWebsiteUrl: 'https://example.com/tech-summit-2023',
  },
  {
    title: 'Music Festival 2023',
    description:
      "Experience the magic of live music at the Music Festival 2023. Join us for three unforgettable days of performances by top artists across various genres. Whether youre a rock fan, a hip-hop enthusiast, or a pop lover, there's something for everyone at this music extravaganza.",
    venue: 'Outdoor Park, Riverside',
    location: {
      city: 'Nashville',
      state: 'TN',
      country: 'USA',
    },
    eventType: 'offline',
    date: new Date('2023-11-20T15:30:00Z'),
    registrationDeadline: new Date('2023-11-15T00:00:00Z'),
    organizer: {
      logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTziNT7AW5MEFDwtHDBUYvvbIg2D6RfRQGw1QBKtq30k8-n5bMQtyqzPEuJoS_ds48Y5Y&usqp=CAU',
    }, // Replace with an actual ObjectId
    slug: 'music-festival-2023',
    attendees: ['AttendeeID3'], // Replace with an actual User ObjectId
    tags: ['Music', 'Festival', 'Concert'],
    imageUrl:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPBuiW5RoW_n14rCeH740InVUblRLMn9i3B2wbEmYSsXv6PoZDIPN-xBaDXMzTOqR-1l0&usqp=CAU', // Replace with image URLs
    eventWebsiteUrl: 'https://example.com/music-festival-2023',
  },
  {
    title: 'Art Exhibition: Beyond Canvas',
    description:
      'Discover the world of art like never before at our exhibition "Beyond Canvas." Immerse yourself in breathtaking paintings, sculptures, and multimedia art pieces created by both established and emerging artists. This is your chance to witness the beauty and creativity of the art world.',
    venue: 'Modern Art Gallery',
    location: {
      city: 'New York',
      state: 'NY',
      country: 'USA',
    },
    eventType: 'offline',
    date: new Date('2023-09-28T10:00:00Z'),
    registrationDeadline: new Date('2023-09-20T00:00:00Z'),
    organizer: {
      logo: 'https://upload.wikimedia.org/wikipedia/commons/6/62/ART_Television_%28Sri_Lanka%29_%28logo%29.png',
    }, // Replace with an actual ObjectId
    slug: 'art-exhibition-beyond-canvas',
    attendees: [], // Replace with actual User ObjectIds
    tags: ['Art', 'Exhibition', 'Creativity'],
    imageUrl:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4KmJKIajFv9mD83eWvPoV_139ONimzZ6XJWvYDQL87r3RnX4BZZ_68880yuRk_QcMwgs&usqp=CAU', // Replace with image URLs
    eventWebsiteUrl: 'https://example.com/art-exhibition',
  },
  {
    title: 'Startup Pitch Competition',
    description:
      "Calling all aspiring entrepreneurs! Showcase your innovative ideas and compete in our Startup Pitch Competition. Get the chance to pitch to a panel of seasoned investors and win funding for your startup. This is the opportunity you've been waiting for to launch your business.",
    venue: 'Innovation Hub',
    location: {
      city: 'Austin',
      state: 'TX',
      country: 'USA',
    },
    eventType: 'offline',
    date: new Date('2023-11-05T14:00:00Z'),
    registrationDeadline: new Date('2023-10-30T00:00:00Z'),
    organizer: {
      logo: 'https://cdn.iconscout.com/icon/free/png-256/free-react-1-282599.png?f=webp',
    }, // Replace with an actual ObjectId
    slug: 'startup-pitch-competition',
    attendees: [], // Replace with actual User ObjectIds
    tags: ['Startup', 'Entrepreneurship', 'Pitch'],
    imageUrl:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPBuiW5RoW_n14rCeH740InVUblRLMn9i3B2wbEmYSsXv6PoZDIPN-xBaDXMzTOqR-1l0&usqp=CAU', // Replace with image URLs
    eventWebsiteUrl: 'https://example.com/startup-competition',
  },
  {
    title: 'Food Festival: Taste of the World',
    description:
      'Embark on a culinary journey at our Food Festival: Taste of the World. Sample delectable dishes from various cuisines, savor exotic flavors, and enjoy live cooking demonstrations. Foodies, this is your chance to indulge in a world of gastronomic delights.',
    venue: 'City Park',
    location: {
      city: 'Los Angeles',
      state: 'CA',
      country: 'USA',
    },
    eventType: 'offline',
    date: new Date('2023-10-28T11:30:00Z'),
    registrationDeadline: new Date('2023-10-20T00:00:00Z'),
    organizer: {
      logo: 'https://cdn.iconscout.com/icon/free/png-256/free-react-1-282599.png?f=webp',
    }, // Replace with an actual ObjectId
    slug: 'food-festival-taste-of-the-world',
    attendees: [], // Replace with actual User ObjectIds
    tags: ['Food', 'Festival', 'Cuisine'],
    imageUrl:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPBuiW5RoW_n14rCeH740InVUblRLMn9i3B2wbEmYSsXv6PoZDIPN-xBaDXMzTOqR-1l0&usqp=CAU', // Replace with image URLs
    eventWebsiteUrl: 'https://example.com/food-festival',
  },
  {
    title: 'Virtual Coding Bootcamp',
    description:
      'Level up your coding skills from the comfort of your home with our Virtual Coding Bootcamp. Dive into hands-on coding exercises, learn from industry experts, and build real-world projects. This bootcamp is perfect for both beginners and experienced developers.',
    venue: 'Online (Virtual)',
    location: {
      city: 'Virtual',
      state: 'NA',
      country: 'Worldwide',
    },
    eventType: 'online',
    date: new Date('2023-09-25T13:00:00Z'),
    registrationDeadline: new Date('2023-09-20T00:00:00Z'),
    organizer: {
      logo: 'https://cdn.iconscout.com/icon/free/png-256/free-react-1-282599.png?f=webp',
    }, // Replace with an actual ObjectId
    slug: 'virtual-coding-bootcamp',
    attendees: [], // Replace with actual User ObjectIds
    tags: ['Coding', 'Online', 'Education'],
    imageUrl:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPBuiW5RoW_n14rCeH740InVUblRLMn9i3B2wbEmYSsXv6PoZDIPN-xBaDXMzTOqR-1l0&usqp=CAU', // Replace with image URLs
    eventWebsiteUrl: 'https://example.com/virtual-bootcamp',
  },
  {
    title: 'Science Symposium 2023',
    description:
      'Explore the frontiers of science at the Science Symposium 2023. Join leading researchers and scientists as they discuss groundbreaking discoveries and advancements. This is your chance to gain insights into the latest developments in various scientific fields.',
    venue: 'Science Center Auditorium',
    location: {
      city: 'Boston',
      state: 'MA',
      country: 'USA',
    },
    eventType: 'offline',
    date: new Date('2023-11-10T08:30:00Z'),
    registrationDeadline: new Date('2023-11-05T00:00:00Z'),
    organizer: {
      logo: 'https://cdn.iconscout.com/icon/free/png-256/free-react-1-282599.png?f=webp',
    }, // Replace with an actual ObjectId
    slug: 'science-symposium-2023',
    attendees: [], // Replace with actual User ObjectIds
    tags: ['Science', 'Symposium', 'Research'],
    imageUrl:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPBuiW5RoW_n14rCeH740InVUblRLMn9i3B2wbEmYSsXv6PoZDIPN-xBaDXMzTOqR-1l0&usqp=CAU', // Replace with image URLs
    eventWebsiteUrl: 'https://example.com/science-symposium',
  },
  {
    title: 'Fitness Challenge: 10K Run',
    description:
      "Get ready for a fitness challenge like no other! Join us for the 10K Run and push your limits. Whether you're an experienced runner or a beginner, this event is a great way to stay active and achieve your fitness goals. Lace up your running shoes and let's go!",
    venue: 'City Park',
    location: {
      city: 'Chicago',
      state: 'IL',
      country: 'USA',
    },
    eventType: 'offline',
    date: new Date('2023-10-02T07:00:00Z'),
    registrationDeadline: new Date('2023-09-25T00:00:00Z'),
    organizer: {
      logo: 'https://cdn.iconscout.com/icon/free/png-256/free-react-1-282599.png?f=webp',
    }, // Replace with an actual ObjectId
    slug: 'fitness-challenge-10k-run',
    attendees: [], // Replace with actual User ObjectIds
    tags: ['Fitness', 'Running', 'Health'],
    imageUrl:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPBuiW5RoW_n14rCeH740InVUblRLMn9i3B2wbEmYSsXv6PoZDIPN-xBaDXMzTOqR-1l0&usqp=CAU', // Replace with image URLs
    eventWebsiteUrl: 'https://example.com/fitness-challenge',
  },
  {
    title: 'Startup Networking Mixer',
    description:
      "Connect with fellow entrepreneurs and investors at our Startup Networking Mixer. Build valuable connections, share insights, and explore potential partnerships. Whether you're a seasoned entrepreneur or just starting, this event offers networking opportunities you won't want to miss.",
    venue: 'Tech Hub, Downtown',
    location: {
      city: 'Seattle',
      state: 'WA',
      country: 'USA',
    },
    eventType: 'offline',
    date: new Date('2023-11-15T18:00:00Z'),
    registrationDeadline: new Date('2023-11-10T00:00:00Z'),
    organizer: {
      logo: 'https://cdn.iconscout.com/icon/free/png-256/free-react-1-282599.png?f=webp',
    }, // Replace with an actual ObjectId
    slug: 'startup-networking-mixer',
    attendees: [], // Replace with actual User ObjectIds
    tags: ['Startup', 'Networking', 'Entrepreneurship'],
    imageUrl:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPBuiW5RoW_n14rCeH740InVUblRLMn9i3B2wbEmYSsXv6PoZDIPN-xBaDXMzTOqR-1l0&usqp=CAU', // Replace with image URLs
    eventWebsiteUrl: 'https://example.com/networking-mixer',
  },
];
