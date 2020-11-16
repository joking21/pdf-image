
import React, { memo, useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Button } from 'antd-mobile';
import * as PDFJS from 'pdfjs-dist';
import { transCrossUrl, getCDNServer } from '@/utils/utils';
import styles from '../index.less';
// PDFJS.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.3.200/pdf.worker.min.js';
// PDFJS.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.3.200/pdf.worker.min.js';
PDFJS.GlobalWorkerOptions.workerSrc = getCDNServer`/qywx/pdf.worker.js`;
// PDFJS.GlobalWorkerOptions.workerSrc = `pdfjs-dist/build/pdf.worker.js`;
// PDFJS.GlobalWorkerOptions.workerSrc='http://localhost:3000/scripts/pdf.worker.js';
const PdfView = (props: any, ref: any) => {
  const pdfCanvas = useRef(null);
  const [pdfStream, setPdfStream] = useState();
  const [scale, setScale] = useState(1);
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(null);
  const [pdfWidth, setPdfWidth] = useState(0);
  useEffect(() => {
    startPdf();
  }, [])
  useImperativeHandle(ref, () => {
		return {
			getState() {
				return {
          scale : scale,
          pageNumber: pageNumber,
          numPages: numPages
        }
			}
		}
	})
  const startPdf = async () => {
    const defaultWidth = document.body.clientWidth;
    setPdfWidth(defaultWidth);
    const loadingTask = PDFJS.getDocument(transCrossUrl(props.url));
    loadingTask.promise.then((pdf) => {
      setPdfStream(pdf);
      setNumPages(pdf._pdfInfo.numPages);
      props.setNumPages(pdf._pdfInfo.numPages);
      renderPdf(pdf, defaultWidth, pageNumber);
      props.setLoading(false);
    }, (reason) => {
      console.error('错误', reason);
      props.setLoading(false);
    });
  }

  const renderPdf = (pdf, defaultWidth, pageNum) => {
    pdf.getPage(pageNum).then((page) => {
      console.log('Page loaded');
      // const scale = 1;
      const viewport = page.getViewport({ scale: 1 });
      const scale = defaultWidth / viewport.width;
      // const scale = 1;
      console.log(scale);
      setScale(scale);
      const defaultViewport = page.getViewport({ scale: scale });
      const canvas = pdfCanvas.current;
      const context = canvas.getContext('2d');
      canvas.height = defaultViewport.height;
      canvas.width = defaultViewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: defaultViewport
      };
      const renderTask = page.render(renderContext);
      renderTask.promise.then(() => {
        console.log('Page rendered');
      });
    });
  }

  const lastPage = () => {
    const pageNum = pageNumber - 1;
    renderPdf(pdfStream, document.body.clientWidth, pageNum);
    setPageNumber(pageNum);
  }
  const nextPage = () => {
    const pageNum = pageNumber + 1;
    renderPdf(pdfStream, document.body.clientWidth, pageNum);
    setPageNumber(pageNum);
  }
  const putBig = () => {
    const width = pdfWidth + pdfWidth * 0.1;
    renderPdf(pdfStream, width, pageNumber);
    setPdfWidth(width);
  }
  const putSmall = () => {
    const width = pdfWidth - pdfWidth * 0.1;
    renderPdf(pdfStream, width, pageNumber);
    setPdfWidth(width);
  }
  return (
    <>
      <canvas ref={pdfCanvas}></canvas>
      <div className={styles.pageBtn}>
        <Button onClick={putBig}>放大</Button>
        <Button onClick={putSmall}>缩小</Button>
        {pageNumber > 1 && <Button onClick={lastPage}>上一页</Button>}
        {pageNumber < numPages && <Button onClick={nextPage}>下一页</Button>}
      </div>
    </>
  );
};
// export default memo(PdfView);
export default forwardRef(PdfView);
