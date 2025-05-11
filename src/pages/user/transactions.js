import { useEffect, useState } from 'react';
import UserService from '../../services/userService';
import AuthService from '../../services/auth.service';
import Header from '../../components/utils/header';
import Message from '../../components/utils/message';
import Loading from '../../components/utils/loading';
import Search from '../../components/utils/search';
import usePagination from '../../hooks/usePagination';
import PageInfo from '../../components/utils/pageInfo';
import TransactionList from '../../components/userTransactions/transactionList.js';
import { useLocation } from 'react-router-dom';
import Info from '../../components/utils/Info.js';
import Container from '../../components/utils/Container.js';
import toast, { Toaster } from 'react-hot-toast';
import { exportToCSV, exportToPDF, prepareTransactionData } from '../../components/utils/exportData';


function Transactions() {

    const [userTransactions, setUserTransactions] = useState([]);
    const [isFetching, setIsFetching] = useState(true);
    const [transactionType, setTransactionType] = useState('')
    const location = useLocation();

    const {
        pageSize, pageNumber, noOfPages, sortField, sortDirec, searchKey,
        onNextClick, onPrevClick, setNoOfPages, setNoOfRecords, setSearchKey, getPageInfo
    } = usePagination('date')

    const getTransactions = async () => {
        await UserService.get_transactions(AuthService.getCurrentUser().email, pageNumber,
            pageSize, searchKey, sortField, sortDirec, transactionType).then(
                (response) => {
                    if (response.data.status === "SUCCESS") {
                        setUserTransactions(response.data.response.data)
                        setNoOfPages(response.data.response.totalNoOfPages)
                        setNoOfRecords(response.data.response.totalNoOfRecords)
                        return
                    }
                },
                (error) => {
                    toast.error("Failed to fetch all transactions: Try again later!")
                }
            )
        setIsFetching(false)
    }

    useEffect(() => {
        getTransactions()
    }, [pageNumber, searchKey, transactionType, sortDirec, sortField])

    useEffect(() => {
        location.state && toast.success(location.state.text)
        location.state = null
    }, [])

    const handleExport = (format) => {
        // Собираем все транзакции в один массив
        let allTransactions = [];
        if (userTransactions && typeof userTransactions === 'object') {
            Object.values(userTransactions).forEach(arr => {
                if (Array.isArray(arr)) allTransactions = allTransactions.concat(arr);
            });
        }

        console.log('allTransactions:', allTransactions, Array.isArray(allTransactions));

        if (!Array.isArray(allTransactions) || allTransactions.length === 0) {
            toast.error("No transactions to export!");
            return;
        }
        try {
            const preparedData = prepareTransactionData(allTransactions);
            if (format === 'csv') {
                exportToCSV(preparedData, 'transactions');
                toast.success("CSV file downloaded successfully!");
            } else if (format === 'pdf') {
                exportToPDF(preparedData, 'transactions');
                toast.success("PDF file downloaded successfully!");
            }
        } catch (error) {
            console.error('Export error:', error);
            toast.error("Failed to export data. Please try again.");
        }
    };

    return (
        <Container activeNavId={1}>
            <Header title="Transactions History" />
            <Toaster/>

            {(userTransactions.length === 0 && isFetching) && <Loading />}
            {(!isFetching) &&
                <>
                    <div className='utils'>
                        <Filter
                            setTransactionType={(val) => setTransactionType(val)}
                        />
                        <div className='page'>
                            <Search
                                onChange={(val) => setSearchKey(val)}
                                placeholder="Search transactions"
                            />
                            <PageInfo
                                info={getPageInfo()}
                                onPrevClick={onPrevClick}
                                onNextClick={onNextClick}
                                pageNumber={pageNumber}
                                noOfPages={noOfPages}
                            />
                        </div>
                    </div>
                    {(userTransactions.length === 0) && <Info text={"No transactions found!"} />}
                    {(userTransactions.length !== 0) && <TransactionList list={userTransactions} />}
                    <div className='transactions-header'>
                        <div className='export-buttons'>
                            <button onClick={() => handleExport('csv')} className='export-btn'>
                                <i className="fa fa-file-excel-o"></i> Export CSV
                            </button>
                            <button onClick={() => handleExport('pdf')} className='export-btn'>
                                <i className="fa fa-file-pdf-o"></i> Export PDF
                            </button>
                        </div>
                    </div>
                </>
            }
        </Container>
    )
}

export default Transactions;


function Filter({ setTransactionType }) {
    return (
        <select onChange={(e) => setTransactionType(e.target.value)} style={{ margin: '0 15px 0 0' }}>
            <option value="">All</option>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
        </select>
    )
}


