import React from "react";

const About = () => {
  return (
    <div className="bg-gray-50 min-h-screen pt-20">
      <div className="mx-auto px-16 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 font-playfair text-center">
            About <span className="text-green-600">Amruta's</span> Art Gallery
          </h1>

          <div className="bg-white rounded-xl shadow-lg p-8 mb-10">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="w-full md:w-1/2">
                <img
                  src="https://images.unsplash.com/photo-1514195037031-83d60ed3b448?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGFydCUyMGdhbGxlcnl8ZW58MHx8MHx8fDA%3D"
                  alt="Art Gallery Interior"
                  className="rounded-lg shadow-md w-full h-auto object-cover"
                />
              </div>
              <div className="w-full md:w-1/2">
                <h2 className="text-2xl font-bold mb-4 font-playfair text-gray-800">
                  Our Story
                </h2>
                <p className="text-gray-700 mb-4">
                  Amruta's Art Gallery was founded in 2020 with a passion for
                  bringing exceptional artistic talent to art lovers worldwide.
                  What started as a small collection has grown into a curated
                  gallery featuring works from established and emerging artists.
                </p>
                <p className="text-gray-700">
                  We believe that art has the power to transform spaces and
                  lives. Our mission is to connect artists with collectors and
                  enthusiasts who appreciate the beauty and meaning behind each
                  creation.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 mb-10">
            <h2 className="text-2xl font-bold mb-6 font-playfair text-gray-800">
              Our Vision
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-3 text-green-700">
                  Supporting Artists
                </h3>
                <p className="text-gray-700">
                  We are committed to providing a platform for artists to
                  showcase their work and connect with a global audience. We
                  believe in fair compensation and recognition for artistic
                  talent.
                </p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-3 text-green-700">
                  Curating Excellence
                </h3>
                <p className="text-gray-700">
                  Every piece in our gallery is carefully selected for its
                  quality, originality, and artistic merit. We pride ourselves
                  on our curatorial eye and commitment to excellence.
                </p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-3 text-green-700">
                  Art Education
                </h3>
                <p className="text-gray-700">
                  Beyond selling art, we aim to educate our community about art
                  history, techniques, and appreciation through workshops, blog
                  posts, and events.
                </p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-3 text-green-700">
                  Sustainability
                </h3>
                <p className="text-gray-700">
                  We are committed to environmentally friendly practices in our
                  packaging, shipping, and gallery operations to minimize our
                  ecological footprint.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 font-playfair text-gray-800">
              Meet the Founder
            </h2>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-64 h-64 rounded-full overflow-hidden shadow-lg flex-shrink-0 mx-auto md:mx-0">
                <img
                  src="https://images.unsplash.com/photo-1589571894960-20bbe2828d0a?q=80&w=1972&auto=format&fit=crop"
                  alt="Amruta - Gallery Founder"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">
                  Amruta
                </h3>
                <p className="text-gray-600 mb-1">
                  Founder & Creative Director
                </p>
                <p className="text-gray-700 mt-4">
                  With a background in fine arts and a passion for discovering
                  new talent, Amruta founded this gallery to create a space
                  where art can thrive. Her curatorial vision focuses on diverse
                  styles, techniques, and cultural perspectives that tell
                  compelling stories through visual art.
                </p>
                <p className="text-gray-700 mt-4">
                  "My goal is to make art accessible while preserving its value
                  and significance. I believe that every home deserves to be
                  enriched by original artwork that resonates with the owner's
                  personality and values."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
