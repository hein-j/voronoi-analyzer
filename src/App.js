import './App.sass';
import Footer from './footer/Footer';
import {useState, useEffect} from 'react';
import getInitialPositions from './helpers/getInitialPositions';
import getApices from './helpers/getApices';
import {Delaunay} from 'd3';
import findFinite from './helpers/findFinite';
import getAreaInfo from './helpers/getAreaInfo';
import findSkewnessAndCoefficient from './helpers/findSkewnessAndCoefficient';
import Graph from './graph/Graph';
import Diagram from './diagram/Diagram';
import Calculations from './calculations/Calculations';
import Popup from './popup/Popup';
import Downloads from './downloads/Downloads';

function App() {
  
  function processPositions(positions) {
    const apices = getApices(positions);
    // initiate voronoi
    const buffer = 100;
    const voronoi = Delaunay.from(positions).voronoi([apices.min[0] - buffer, apices.min[1] - buffer, apices.max[0] + buffer, apices.max[1] + buffer]);
    const isFinite = findFinite(voronoi);
    const areasInfo = getAreaInfo(voronoi, isFinite);
    if (areasInfo.areas.length === 0) {
      throw new Error('There are no finite cells to calculate areas for. Please try adding more coordinates.')
    }
    const {skewness, coefficient} = findSkewnessAndCoefficient(areasInfo, voronoi, isFinite);
    if (coefficient === "error") {
      throw new Error('There is only 1 finite area, so the clustering coefficient could not be calculated. Please try adding more coordinates.')
    }
    return {
      positions: positions,
      apices: apices,
      areas: areasInfo.areas,
      skewness: skewness,
      coefficient: coefficient
    }
  }

  function changePositions(positions) {
    try {
      const newObj = processPositions(positions);
      setPositionsObj(newObj);
    } catch (e) {
        alert (e);
        window.location.reload();
    }
  }
  
  const [positionsObj, setPositionsObj] = useState(processPositions(getInitialPositions()));

  const [popupObj, setPopupObj] = useState({
    isOpen:false,
    child: <div></div>
  })

  function openPopup (child, childTypeName = "notDownloads") {
    let childEl = child;
    if (childTypeName === "Downloads") {
      childEl = <Downloads positionsObj={positionsObj} />
    }
    setPopupObj({
      isOpen: true,
      child: childEl
    })
  }

  function closePopup () {
    setPopupObj({
      isOpen: false,
      child: <div></div>
    })
  }

  useEffect(() => {
    window.addEventListener("keydown", (e) => {
      if (e.key !== 'Escape') {
        return;
      }
      closePopup();
    })
  }, [])

  const DiagramComp = <Diagram positions={positionsObj.positions} apices={positionsObj.apices}/>;
  const SkewnessComp = <Calculations name={"Skewness"} value={positionsObj.skewness} />;
  const CoefficientComp = <Calculations name={"Coefficient"} value={positionsObj.coefficient} />;
  const GraphComp = <Graph areas={positionsObj.areas} />;

  return (
    <div className='container'>
      <Popup obj={popupObj} close={closePopup} />
      <div className="centered-container">
        <div className="cell" onClick={() => openPopup(DiagramComp)}>
          {DiagramComp}
        </div>
        <div className="cell" onClick={() => openPopup(SkewnessComp)}>
          {SkewnessComp}
        </div>
        <div className="cell" onClick={() => openPopup(CoefficientComp)}>
          {CoefficientComp}
        </div>
        <div className="cell" onClick={() => openPopup(GraphComp)}>
          {GraphComp}
        </div>
      </div>
      <Footer positionsCallBack={changePositions} openPopup={openPopup} closePopup={closePopup}/>
    </div>
  );
}

export default App;
