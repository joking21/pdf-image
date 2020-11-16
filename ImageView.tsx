
import React, { memo, useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Button } from 'antd-mobile';
import { transCrossUrl } from '@/utils/utils';
import styles from '../index.less';

const baseImgWidth = window.screen.availWidth;
const baseImgHeight = window.screen.availHeight - 400;

const ImageView = (props: any, ref: any) => {
	const canvasRef = useRef(null);
	const [imageParams, setImageParams] = useState({
		width: baseImgWidth,
		height: baseImgHeight,
		scale: 1,
		actualWidth: 0,
		actualHeight: 0,
	});
	// const [imgurl, setImgurl] = useState('');
	useImperativeHandle(ref, () => {
		return {
			getState() {
				return {
					scale: imageParams.scale,
					canvasRef: canvasRef,
					actualWidth: imageParams.actualWidth,
					actualHeight: imageParams.actualHeight
				}
			},

			drawImage(param, ImgParam) {
				drawAndShareImage(param, ImgParam)
			}

		}
	})

	const handleImg = () => {
		let baseImg = new Image();
		const { url } = props;
		baseImg.src = url;
		let nowWidth, nowHeight, nowRatio;
		baseImg.onload = (() => {
			if (baseImg.width > baseImgWidth) {
				nowWidth = baseImgWidth;
				nowRatio = (baseImgWidth / baseImg.width).toFixed(3);
				nowHeight = Number((baseImg.height * nowRatio).toFixed(3));
			} else {
				nowWidth = baseImg.width;
				nowRatio = 1;
				nowHeight = baseImg.height;
			}
			console.log({
				width: nowWidth,
				height: nowHeight,
				scale: nowRatio,
			});
			setImageParams({
				width: nowWidth,
				height: nowHeight,
				scale: nowRatio,
				actualWidth: baseImg.width,
				actualHeight: baseImg.height,
			})
			props.setLoading(false);
		})
	}


	const putBig = () => {
		const width = imageParams.width + imageParams.width * 0.1;
		const height = imageParams.height + imageParams.height * 0.1;
		setImageParams(Object.assign({}, imageParams, {
			width: width,
			height: height,
		}))
	}
	const putSmall = () => {
		const width = imageParams.width - imageParams.width * 0.1;
		const height = imageParams.height - imageParams.height * 0.1;
		setImageParams(Object.assign({}, imageParams, {
			width: width,
			height: height,
		}))
	}

	const drawAndShareImage = (param, ImgParam) => {
		const actualLeft = ImgParam.left / imageParams.scale;
		const actualTop = ImgParam.top / imageParams.scale;
		const actualWidth = param.imgWidth;
		const actualHeight = param.imgHeight;
		const { url, signUrl } = param;
		let canvas = canvasRef.current;
		canvas.width = imageParams.actualWidth;
		canvas.height = imageParams.actualHeight;
		let context = canvas.getContext("2d");
		context.rect(0, 0, canvas.width, canvas.height);
		let myImage = new Image();
		myImage.src = transCrossUrl(url);
		// myImage.crossOrigin = 'Anonymous';
		myImage.setAttribute("crossOrigin", 'Anonymous');
		myImage.onload = function () {
			context.drawImage(myImage, 0, 0, imageParams.actualWidth, imageParams.actualHeight);
			let myImage2 = new Image();
			myImage2.src = transCrossUrl(signUrl);
			myImage2.setAttribute("crossOrigin", 'Anonymous');
			myImage2.onload = function () {
				let xnumber = 0;
				let ynumber = 0;
				const transLeft = actualLeft < 0 ? 0 : actualLeft;
				const transTop = actualTop < 0 ? 0 : actualTop;
				context.translate(transLeft, transTop);
				context.rotate(ImgParam.deg * Math.PI / 180);
				if (ImgParam.deg === 90) {
					xnumber = 15;
					ynumber = 15;
				} else if (ImgParam.deg === 180) {
					xnumber = actualWidth;
					ynumber = 25;
				}
				else if (ImgParam.deg === 270) {
					xnumber = actualHeight + 15;
					ynumber = actualWidth + 15;
				}
				else if (ImgParam.deg === 0 || ImgParam.deg === 360) {
					ynumber = actualWidth;
				}
				context.translate(-transLeft - xnumber, -transTop - actualWidth + ynumber);
				context.drawImage(myImage2, actualLeft, actualTop, actualWidth, actualHeight);
				const base64 = canvas.toDataURL('image/png');
				props.imgPost(base64);
				// setImgurl(base64);
			}
		}
	}

	return (
		<>
			<div>
				<img src={props.url} width={imageParams.width} height={imageParams.height} onLoad={(e) => {
					handleImg();
				}}
				/>
			</div>
			<div style={{ display: 'none' }}>
				<canvas ref={canvasRef} />
			</div>

			{/* <div>
				<img src={imgurl} />
			</div> */}

			<div className={styles.pageBtn}>
				<Button onClick={putBig}>放大</Button>
				<Button onClick={putSmall}>缩小</Button>
				<Button onClick={handleImg}>复位</Button>
			</div>
		</>
	);
};

export default forwardRef(ImageView);
// export default memo(ImageView);
