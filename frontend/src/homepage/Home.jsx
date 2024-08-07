import React from 'react'
import { useContext } from 'react';
import { UserContext } from '../signup/UserContext';


const Home = () => {
  const { username } = useContext(UserContext);
  return (
    <div>
      <h1>Welcome {username}to my home page</h1>
      <h1>displaying products</h1>
      Home
    </div>
  )
}

export default Home
