import { useState } from "react";
import "./login.css";
import axios from "axios";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Sayfa modunu tutan state
  const [mode, setMode] = useState("login");

  // Login state
  const [login, setLogin] = useState({
    email: "",
    password: "",
    isAdmin: false,
  });

  // Register state
  const [register, setRegister] = useState({
    email: "",
    userName: "",
    password: "",
    passwordRepeat: "",
    sicilNo: "",
    department: "",
    position: "",
  });

  // Hata mesajı için state
  const [errorMsg, setErrorMsg] = useState("");

  const fetchLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        login,
        { withCredentials: true }
      );
      dispatch({ type: "SET_USER", payload: response.data });
      navigate("/");
      window.location.reload();
    } catch (error) {
      setErrorMsg(error.response?.data?.error || "Login failed.");
    }
  };

  const fetchRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    if (register.password !== register.passwordRepeat) {
      setErrorMsg("Şifreler eşleşmiyor!");
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        register
      );
      dispatch({ type: "SET_USER", payload: response.data });
      window.location.reload();
    } catch (error) {
      setErrorMsg(error.response?.data?.error || "Register failed.");
    }
  };

  return (
    <div className="pageBody">
      {errorMsg && (
        <div className="errorMsg" style={{ color: "red", marginBottom: "10px" }}>
          {errorMsg}
        </div>
      )}
      {mode === "login" && (
        <>
          <form onSubmit={fetchLogin} className="loginForm">
            <h2 className="formHeader">Giriş Yap</h2>
            <div className="form">
              <input
                className="loginInput"
                type="email"
                placeholder="E-posta"
                onChange={(e) =>
                  setLogin({ ...login, email: e.target.value })
                }
                value={login.email}
                required
              />
            </div>
            <div className="form">
              <input
                className="loginInput"
                type="password"
                placeholder="Şifre"
                onChange={(e) =>
                  setLogin({ ...login, password: e.target.value })
                }
                value={login.password}
                required
              />
            </div>
            <button type="submit" className="loginBtn">
              Giriş Yap
            </button>
          </form>
          <div className="switchText">
            Hesabınız yok mu?{" "}
            <span
              className="switchLink"
              style={{ color: "#1fc9d8", cursor: "pointer", textDecoration: "underline" }}
              onClick={() => setMode("register")}
            >
              Kaydolun
            </span>
          </div>
        </>
      )}

      {mode === "register" && (
        <>
          <form onSubmit={fetchRegister} className="loginForm">
            <h2 className="formHeader">Kaydol</h2>
            <div className="form">
              <input
                className="loginInput"
                type="email"
                placeholder="E-posta"
                onChange={(e) =>
                  setRegister({ ...register, email: e.target.value })
                }
                value={register.email}
                required
              />
            </div>
            <div className="form">
              <input
                className="loginInput"
                type="text"
                placeholder="Kullanıcı Adı"
                onChange={(e) =>
                  setRegister({ ...register, userName: e.target.value })
                }
                value={register.userName}
                required
              />
            </div>
            <div className="form">
              <input
                className="loginInput"
                type="text"
                placeholder="Sicil No"
                onChange={(e) =>
                  setRegister({ ...register, sicilNo: e.target.value })
                }
                value={register.sicilNo}
                required
              />
            </div>
            <div className="form">
              <input
                className="loginInput"
                type="text"
                placeholder="Departman"
                onChange={(e) =>
                  setRegister({ ...register, department: e.target.value })
                }
                value={register.department}
                required
              />
            </div>
            <div className="form">
              <input
                className="loginInput"
                type="text"
                placeholder="Pozisyon"
                onChange={(e) =>
                  setRegister({ ...register, position: e.target.value })
                }
                value={register.position}
                required
              />
            </div>
            <div className="form">
              <input
                className="loginInput"
                type="password"
                placeholder="Şifre"
                onChange={(e) =>
                  setRegister({ ...register, password: e.target.value })
                }
                value={register.password}
                required
              />
            </div>
            <div className="form">
              <input
                className="loginInput"
                type="password"
                placeholder="Şifre Tekrar"
                onChange={(e) =>
                  setRegister({ ...register, passwordRepeat: e.target.value })
                }
                value={register.passwordRepeat}
                required
              />
            </div>
            <button className="loginBtn" type="submit">
              Kaydol
            </button>
          </form>
          <div className="switchText">
            Zaten hesabınız var mı?{" "}
            <span
              className="switchLink"
              style={{ color: "#1fc9d8", cursor: "pointer", textDecoration: "underline" }}
              onClick={() => setMode("login")}
            >
              Giriş Yapın
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default Login;