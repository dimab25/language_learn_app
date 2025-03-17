import { MouseEvent, useContext, useEffect, useState } from "react";
import { Posts, User, Watchlist } from "../types/customTypes";
import { Button, Image, Modal } from "react-bootstrap";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router";
import UserImagePost from "../components/UserImagePost";
import getFormattedDate from "../utilities/changeDate";
import UpdateProfile from "../components/UpdateProfile";

function MyProfile() {
  const { user } = useContext(AuthContext);

  const [file, setFile] = useState<User[] | null>(null);
  const [movieWatchlist, setMovieWatchlist] = useState<Watchlist[]| null>(null);

  const [show, setShow] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Posts| null>(null);
  const [deleteMessage, setdeleteMessage] = useState("");
  const handleClose = () => {
    setShow(false);
    setSelectedPost(null);
  };
  const handleShow = (post) => {
    setShow(true);
    setSelectedPost(post);
  };


  const getProfileById = async () => {
    fetch(`http://localhost:4000/api/users/all/id/${user?._id}`)
      .then((response) => response.json())
      .then((result) => setFile(result.userById))

      .catch((error) => console.error(error));
  };

  console.log("file :>> ", file);
  console.log("user :>> ", user);
  // console.log('file[0]._id :>> ', file[0]._id);
  const getMovieWatchlist = async () => {
    const requestOptions = {
      method: "GET",
      redirect: "follow",
    };
    fetch(
      `http://localhost:4000/api/movie/watchlist/user_id/${user?._id}`,
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => setMovieWatchlist(result.movieWatchlistById))
      .catch((error) => console.error(error));
  };

  const deleteUserPost = async (id: string, e: MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();

    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

      const urlencoded = new URLSearchParams();
      if (user) {
        urlencoded.append("user_id", user._id);
      }

      const requestOptions = {
        method: "DELETE",
        headers: myHeaders,
        body: urlencoded,
        redirect: "follow",
      };
      const response = await fetch(
        `http://localhost:4000/api/users/image/delete/post/${id}`,
        requestOptions
      );
      const result = await response.json();
      setdeleteMessage(result);
    } catch (error) {
      console.log("error :>> ", error);
    }
  };

  // console.log("movieWatchlist :>> ", movieWatchlist);
  console.log("deleteMessage :>> ", deleteMessage);
  useEffect(() => {
    if (user && user._id) {
      getProfileById();
    }
    getMovieWatchlist();
  }, [user?._id]);

  // const [user, setUser] = useState<User | null>(null);

  // const getMyProfile = async () => {
  //   const token = localStorage.getItem("token");

  //   const myHeaders = new Headers();

  //   myHeaders.append("Authorization", `Bearer ${token} `);

  //   const requestOptions = {
  //     method: "GET",
  //     headers: myHeaders,
  //   };
  //   try {
  //     const response = await fetch(
  //       "http://localhost:4000/api/users/myprofile",
  //       requestOptions
  //     );
  //     if (!response.ok) {
  //       console.log("Something went wrong");
  //     }
  //     if (response.ok)
  //     {  const result = await response.json();
  //       setUser(result);}

  //   } catch (error) {
  //     console.log("error :>> ", error);
  //   }
  // };
console.log('selectedPost :>> ', selectedPost);
  return (
    <>
      <div className="pageLayout">
        <div className="userInfoDiv">
          {file ? (
            <div>
              
              <Image
                src={file[0].imageUrl}
                alt="user profile pic"
                style={{ width: "250px", height: "auto", borderRadius:"25px" }}
              />
              <h5> {file[0].name}</h5>
              <p>Age: {file[0].age}</p>
              <p>E-Mail: {file[0].email}</p>
              <p>Location: {file[0].location}</p>
              <p>Native Language: {file[0].native_language}</p>
              <p>Target Language: {file[0].target_language}</p>
              <p>Level: {file[0].target_language_level}</p>
              <div className="aboutDiv">About me <br /><i>{file[0].about}</i></div>
            </div>
          ) : (
            <h5>You have to login</h5>
          )}
        <UpdateProfile profile={file}/>
        </div>
        <div className="movieListFullDiv">
          <h4>Movielist</h4>
          <div className="movielistDiv">
            {movieWatchlist &&
              movieWatchlist.map((movie) => (
                <>
                  <Link as to={`/moviesDetails/?id=${movie.movie_id}`}>
                    <Image
                      src={movie.imageUrl}
                      style={{ width: "100px", borderRadius: "25px" }}
                    />
                  </Link>
                </>
              ))}
          </div>
        </div>

        <div className="postedImagesFullDiv">
          <UserImagePost getProfileById={getProfileById} />
          <div className="postedImages">
           
            {file &&
              file[0].posts?.map((item, index) => (
                <>
                  <div key={index}>
                    <Image
                      style={{ width: "200px" }}
                      src={item.imageUrl}
                      onClick={() => handleShow(item)}
                    />

                    <Modal size="xl" show={show} onHide={handleClose}>
                      <Modal.Header closeButton>
                        {/* <Modal.Title>Modal heading</Modal.Title> */}
                      </Modal.Header>
                      <Modal.Body>
                        <Image
                          style={{ width: "auto" }}
                          src={selectedPost?.imageUrl}
                          fluid
                        />
                        <div>{selectedPost?.text}</div>{" "}
                      </Modal.Body>
                      <Modal.Footer>
                        <div>{getFormattedDate(selectedPost?.created_at)}</div>{" "}
                        <Button
                          variant="outline-danger"
                          onClick={(e) => deleteUserPost(item._id, e)}
                        >
                          Delete
                        </Button>
                        <Button variant="secondary" onClick={handleClose}>
                          Close
                        </Button>
                      </Modal.Footer>
                    </Modal>
                  </div>
                </>
              ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default MyProfile;
