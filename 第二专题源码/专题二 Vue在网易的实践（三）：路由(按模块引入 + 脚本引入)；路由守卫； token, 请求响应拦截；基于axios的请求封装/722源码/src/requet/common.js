import service from './axios';

//耦合度很低
export default function requestOfPost(url,data){
    return service.post(url,data);
}

// function requestOfPost(url,data){
//     return axios.get(url,data);
// }