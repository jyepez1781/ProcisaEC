
import React from 'react';
import { Usuario } from '../../types';
import { useLogin } from '../../hooks/useLogin';
import { LoginHeader } from './LoginHeader';
import { LoginForm } from './LoginForm';
import { LoginFooter } from './LoginFooter';

interface LoginProps {
  onLogin: (user: Usuario) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { 
    email, setEmail, 
    password, setPassword, 
    loading, error, 
    handleLogin 
  } = useLogin(onLogin);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <LoginHeader />
        
        <LoginForm 
          email={email} 
          setEmail={setEmail}
          pass={password}
          setPass={setPassword}
          loading={loading}
          error={error}
          onSubmit={handleLogin}
        />

        <LoginFooter />
      </div>
    </div>
  );
};

export default Login;
