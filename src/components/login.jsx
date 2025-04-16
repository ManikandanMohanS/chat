import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

function Login() {
  const gradients = [
    'linear-gradient(135deg, #5c258d, #4389a2)',
    'linear-gradient(135deg, #4776e6, #8e54e9)',
    'linear-gradient(135deg, #1fa2ff, #12d8fa)',
    'linear-gradient(135deg, #FF61D2, #FE9090)',
    'linear-gradient(135deg, #0f0c29, #a6ffcb)',
  ];

  const [bg, setBg] = useState(gradients[0]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % gradients.length;
      setBg(gradients[index]);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAuth = async () => {
    try {
      let userCredential;

      if (isSignUp) {
        // Sign up
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Save new user to Firestore
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          name: user.email.split('@')[0], // Default name from email
          photoURL: '',
          isOnline: true,
          createdAt: new Date(),
        });

        console.log('Signed up and added to Firestore:', user.email);
      } else {
        // Login
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, 'users', user.uid), {
          isOnline: true,
        }, { merge: true });

        console.log('Signed in successfully:', user.email);
      }
    } catch (error) {
      console.error('Auth error:', error.message);
      alert(error.message);
    }
  };

  const text = 'Welcome to Chat App';
  const animatedText = text.split('').map((char, index) => (
    <span
      key={index}
      className="dynamic-letter"
      style={{ animationDelay: `${index * 0.15}s` }}
    >
      {char}
    </span>
  ));

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100 px-3"
      style={{ background: bg, transition: 'background 5s ease-in-out' }}
    >
      <style>{`
        .dynamic-letter {
          font-weight: bold;
          font-size: 2.2rem;
          display: inline-block;
          animation: rainbowText 3s infinite alternate;
        }

        @keyframes rainbowText {
          0% { color: #ff0000; }
          20% { color: #ff9900; }
          40% { color: #33cc33; }
          60% { color: #00ccff; }
          80% { color: #9900ff; }
          100% { color: #ff3399; }
        }

        .login-card {
          background-color: rgba(28, 28, 30, 0.95);
          border-radius: 24px;
          padding: 50px 40px;
          width: 100%;
          max-width: 480px;
          color: #fff;
          box-shadow: 0 0 30px rgba(0, 0, 0, 0.3);
        }

        .rainbow-text-line {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 2px;
          flex-direction: row;
        }

        @media (max-width: 576px) {
          .login-card {
            padding: 30px 20px;
            max-width: 100%;
          }

          .dynamic-letter {
            font-size: 1.7rem;
          }
        }
      `}</style>

      <div className="login-card text-center">
        <div className="rainbow-text-line mb-4">{animatedText}</div>

        <input
          type="email"
          placeholder="Email"
          className="form-control mb-3"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="form-control mb-3"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button
          className="btn btn-outline-light btn-lg rounded-pill w-100"
          onClick={handleAuth}
        >
          {isSignUp ? 'Sign Up' : 'Login'}
        </button>

        <p className="mt-3 text-light">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <span
            onClick={() => setIsSignUp(!isSignUp)}
            style={{ textDecoration: 'underline', cursor: 'pointer', color: '#0bf' }}
          >
            {isSignUp ? 'Login' : 'Sign Up'}
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;
