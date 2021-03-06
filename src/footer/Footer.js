import './Footer.sass';
import help from '../assets/help.svg';
import {csv} from 'd3';
import Information from '../information/Information';
import footerDownload from '../assets/footer-download.svg';
import {useState, useRef} from 'react';
import Downloads from '../downloads/Downloads';

function Footer (props) {

  const [uploadedFile, setUploadedFile] = useState('');

  function handleFile (e) {
    try {
      props.closePopup();
      const input = e.target;
      if (!input.files.length) {
        return;
      }
      let file = URL.createObjectURL(input.files[0]);
      setUploadedFile(input.files[0]['name']);
      csv(file).then((data) => {
        URL.revokeObjectURL(file);
        let positions = data.map((obj) => {
          const x = parseFloat(obj.x);
          const y = parseFloat(obj.y);
          if (Number.isNaN(x) || Number.isNaN(y) || x === Infinity || y === Infinity) {
            throw new Error('Invalid input: Please make sure the first record is a header with the field names "x" and "y" exactly. The rest should be a pair of real numbers (e.g. 1.23, 10.5).')
          }
          return [x, y];
        });
        props.positionsCallBack(positions);
      })
      .catch(e => {
        alert(e);
        window.location.reload();
      })
    } catch {
      alert('Failed to upload file. Please try again.');
      window.location.reload();
    }
  }

  const fileInput = useRef(null);

  function clickFileInput() {
    fileInput.current.click();
  }

  function buttonClicked(e) {
    e.preventDefault();
    if (e.target.alt === 'help') {
      props.openPopup(<Information />);
      return;
    }
    props.openPopup(<Downloads />, "Downloads");
  }

  return (
    <div className="footer">
      <input ref={fileInput} id="hidden-file-input" type="file" accept=".csv" onChange={handleFile}/>
      <div id="displayed-file-input">
        <button onClick={clickFileInput}>Upload csv file</button>
        <span>{uploadedFile}</span>
      </div>
      <input id="download-button" type="image" src={footerDownload} alt="download" onClick={buttonClicked}/>
      <input id="help-button" type="image" src={help} alt="help" onClick={buttonClicked}/>
    </div>
  )

}

export default Footer