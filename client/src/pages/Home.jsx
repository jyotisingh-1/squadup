import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import GameCard from "../components/GameCard";
import bgmi from "../assets/images/bgmi.jpg";
import valorant from "../assets/images/valorant.png";
import gta5 from "../assets/images/gta5.jpg";
import ffmax from "../assets/images/ffmax.jpg";
import codm from "../assets/images/codm.jpg";
import cs2 from "../assets/images/cs2.png";
import "../styles/home.css";
function Home() {

  const games = [
  {
    title: "BGMI",
    genre: "Battle Royale",
    players: "250K+",
    image: bgmi,
  },
  {
    title: "Valorant",
    genre: "FPS",
    players: "180K+",
    image: valorant,
  },
  {
    title: "GTA V",
    genre: "Open World",
    players: "500K+",
    image: gta5,
  },
  {
    title: "Free Fire MAX",
    genre: "Battle Royale",
    players: "320K+",
    image: ffmax,
  },
  {
    title: "COD Mobile",
    genre: "FPS",
    players: "200K+",
    image: codm,
  },
  {
    title: "CS2",
    genre: "Competitive FPS",
    players: "400K+",
    image: cs2,
  },
];

  return (
    <>
      <Navbar />

      <Hero />

      <section className="games-section">

        <h2 className="games-title">
          Popular Games
        </h2>

        <div className="games-grid">

          {games.map((game, index) => (

            <GameCard
              key={index}
              title={game.title}
              genre={game.genre}
              players={game.players}
              image={game.image}
            />

          ))}

        </div>

      </section>
      <section className="features-section">

  <h2 className="features-title">
    Why Choose SquadUp?
  </h2>

  <div className="features-grid">

    <div className="feature-box">
      <h3>🎮 Find Teammates</h3>
      <p>Find skilled players and build your perfect squad.</p>
    </div>

    <div className="feature-box">
      <h3>🏆 Tournaments</h3>
      <p>Join daily tournaments and compete with gamers.</p>
    </div>

    <div className="feature-box">
      <h3>💬 Live Chat</h3>
      <p>Chat with your squad before every match.</p>
    </div>

    <div className="feature-box">
      <h3>🎯 Rank Up</h3>
      <p>Improve your rank with better teammates.</p>
    </div>

  </div>

</section>


    </>
  );
}

export default Home;